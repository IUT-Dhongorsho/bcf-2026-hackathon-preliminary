import { getConversionRate, getSupportedCurrencies } from './currency.js';
import { getLocationCoordinates } from './geocode.js';
import { generateGroqResponse } from '../llm/groqClient.js';
import { formatExternalResponse, StandardResponse } from '../response/formatter.js';

interface ExtractorResponse {
  api: 'getConversionRate' | 'getSupportedCurrencies' | 'getLocation';
  params?: any;
}

function cleanAndParseJson(text: string): any {
  let cleanText = text.trim();
  if (cleanText.startsWith('```json')) {
    cleanText = cleanText.substring(7);
  } else if (cleanText.startsWith('```')) {
    cleanText = cleanText.substring(3);
  }
  if (cleanText.endsWith('```')) {
    cleanText = cleanText.substring(0, cleanText.length - 3);
  }
  cleanText = cleanText.trim();
  return JSON.parse(cleanText);
}

export async function resolveExternalQuery(
  question: string,
  llm: string
): Promise<StandardResponse> {
  const systemPrompt = `
  You are an API parameter extractor. Your task is to identify which external API to call to answer the question, and extract the parameters.
  
  Available APIs:
  1. getConversionRate:
     - Returns exchange rates. Use when the question asks for exchange rates or currency conversions.
     - Parameters: 'base' (string, e.g. "EUR"), 'symbols' (string, comma-separated targets e.g. "USD"), 'date' (optional historical date in YYYY-MM-DD format, e.g. "2024-01-15").
  2. getSupportedCurrencies:
     - Returns supported currency names. Use when asking about currency symbols (e.g., 'CHF') or total supported currencies.
     - Parameters: None.
  3. getLocation:
     - Returns latitude/longitude coordinates.
     - Parameters: 'q' (location search string, e.g., "Denver, Colorado").

  Format output as a JSON object, and do not include any other text or markdown wrapping:
  {
    "api": "getConversionRate" | "getSupportedCurrencies" | "getLocation",
    "params": { ... }
  }
  `;

  const extractionText = await generateGroqResponse(
    `Extract parameters for the question: "${question}"`,
    systemPrompt,
    { temperature: 0.1 }
  );
  
  const callDetails: ExtractorResponse = cleanAndParseJson(extractionText);
  let data: any;

  if (callDetails.api === 'getConversionRate') {
    data = await getConversionRate(callDetails.params);
  } else if (callDetails.api === 'getSupportedCurrencies') {
    data = await getSupportedCurrencies();
  } else if (callDetails.api === 'getLocation') {
    data = await getLocationCoordinates(callDetails.params);
  } else {
    throw new Error(`Unsupported API: ${callDetails.api}`);
  }

  return formatExternalResponse(question, llm, callDetails.api, data);
}
