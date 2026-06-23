import { generateGroqResponse } from './groqClient.js';

type Intent = 'database' | 'external' | 'mixed';

export async function classifyIntent(question: string): Promise<Intent> {
  // Rely entirely on the LLM to classify intent, as simple keyword matching is too brittle.
  // If ambiguous, use LLM
  const prompt = `
Classify the following question into one of three categories:

1. "database" → The question asks for internal company data (e.g., invoices, employees, customers, products).
2. "external" → The question asks for general real-world information like geography (coordinates, latitude, longitude, cities), or general financial data (currency exchange rates, currency names) that has NOTHING to do with the company's internal data.
3. "mixed" → The question asks for internal company data (invoices, revenue, salaries) BUT asks to "convert" or translate that money into another currency (e.g., "convert total revenue to USD").

Question: "${question}"

Answer ONLY with one word: database, external, or mixed.`;

  const result = await generateGroqResponse(prompt, undefined, { temperature: 0.1, maxTokens: 10 });
  const clean = result.trim().toLowerCase();
  if (clean === 'external' || clean === 'mixed' || clean === 'database') {
    return clean;
  }
  return 'database'; // fallback
}
