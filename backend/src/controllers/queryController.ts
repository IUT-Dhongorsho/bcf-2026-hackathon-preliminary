import type { Request, Response } from 'express';
import { generateSQL } from '../services/llm/sqlGenerator.js';
import { classifyIntent } from '../services/llm/intentClassifier.js';
import { executeSQL } from '../services/database/executor.js';
import { getConversionRate } from '../services/external/currency.js';
import { formatResponse } from '../services/response/formatter.js';
import { resolveExternalQuery } from '../services/external/index.js';

export const handleQuery = async (req: Request, res: Response) => {
  try {
    const { question, llm = 'gemini-2.5-flash' } = req.body;
    if (!question) return res.status(400).json({ error: 'Missing "question"' });

    const intent = await classifyIntent(question);
    console.log(`[query] intent="${intent}" question="${question}"`);

    if (intent === 'external') {
      const result = await resolveExternalQuery(question, llm);
      return res.json(result);

    } else if (intent === 'mixed') {
      const result = await handleMixed(question, llm);
      const response = formatResponse({ question, llm, columns: result.columns, rows: result.rows, source: 'mixed' });
      return res.json(response);

    } else {
      const sql = await generateSQL(question);
      console.log(`[query] generated SQL: ${sql}`);
      const result = await executeSQL(sql);
      const rows = result.rows.map((row: Record<string, any>) =>
        result.columns.map((col: string) => row[col])
      );
      const response = formatResponse({ question, llm, columns: result.columns, rows, source: 'database' });
      return res.json(response);
    }

  } catch (error: any) {
    console.error('[query] error:', error);
    res.status(500).json({ error: error.message || 'Internal error' });
  }
};


// Mixed handler: query DB then convert currency values
async function handleMixed(question: string, llm: string) {
  const sql = await generateSQL(question);
  console.log(`[mixed] generated SQL: ${sql}`);
  const dbResult = await executeSQL(sql);

  // Convert DB rows from {col: val} objects to arrays
  const rowArrays = dbResult.rows.map((row: Record<string, any>) =>
    dbResult.columns.map((col: string) => row[col])
  );

  // Determine target currency from question
  const lower = question.toLowerCase();
  let target = 'EUR';
  if (lower.includes('usd') || lower.includes('dollar')) target = 'USD';
  else if (lower.includes('gbp') || lower.includes('pound')) target = 'GBP';
  else if (lower.includes('jpy') || lower.includes('yen')) target = 'JPY';
  else if (lower.includes('inr') || lower.includes('rupee')) target = 'INR';
  else if (lower.includes('bdt') || lower.includes('taka')) target = 'BDT';

  // Determine date from question (look for "January 15, 2024" style dates)
  let date: string = 'latest';
  const dateMatch = question.match(/(\w+ \d{1,2},?\s*\d{4})/);
  if (dateMatch && dateMatch[1]) {
    const parsed = new Date(dateMatch[1]);
    if (!isNaN(parsed.getTime())) {
      date = parsed.toISOString().split('T')[0]!;
    }
  }

  // Fetch conversion rate (base is EUR since DB values are in EUR per schema)
  const rateData = await getConversionRate({ base: 'EUR', symbols: target, date });
  const rate = rateData.rates?.[target];
  if (!rate) throw new Error(`Could not get ${target} rate`);
  console.log(`[mixed] EUR->${target} rate=${rate} (date=${date})`);

  // Apply conversion to numeric columns
  const convertedRows = rowArrays.map((row: any[]) => {
    return row.map((val: any) => {
      if (typeof val === 'number') {
        return parseFloat((val * rate).toFixed(2));
      }
      if (typeof val === 'string' && /^-?\d+(\.\d+)?$/.test(val)) {
        return parseFloat((Number(val) * rate).toFixed(2));
      }
      return val;
    });
  });

  return { rows: convertedRows, columns: dbResult.columns };
}
