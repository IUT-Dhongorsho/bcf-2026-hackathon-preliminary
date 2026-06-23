import { Request, Response } from 'express';
import { generateSQL } from '../services/llm/sqlGenerator.js';
import { classifyIntent } from '../services/llm/intentClassifier.js';
import { executeSQL } from '../services/database/executor.js';
import { convertCurrency } from '../services/external/currency.js';
import { geocode } from '../services/external/geocode.js';
import { formatResponse } from '../services/response/formatter.js';
import { resolveExternalQuery } from '../services/external/index.js';

export const handleQuery = async (req: Request, res: Response) => {
  try {
    const { question, llm = 'gemini-2.5-flash' } = req.body;
    if (!question) return res.status(400).json({ error: 'Missing "question"' });

    const intent = await classifyIntent(question);
    let rows: any[], columns: string[], source: 'database' | 'external' | 'mixed';

    if (intent === 'external') {
      const result = await resolveExternalQuery(question);
      rows = result.rows;
      columns = result.columns;
      source = 'external';
    } else if (intent === 'mixed') {
      const result = await handleMixed(question);
      rows = result.rows;
      columns = result.columns;
      source = 'mixed';
    } else {
      const sql = await generateSQL(question);
      const result = await executeSQL(sql);
      rows = result.rows;
      columns = result.columns;
      source = 'database';
    }

    const response = formatResponse({ question, llm, columns, rows, source });
    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal error' });
  }
};



// Mixed handler
async function handleMixed(question: string) {
  const sql = await generateSQL(question);
  const dbResult = await executeSQL(sql);
  const lower = question.toLowerCase();
  let target = 'EUR';
  if (lower.includes('gbp') || lower.includes('pound')) target = 'GBP';
  else if (lower.includes('inr')) target = 'INR';
  else if (lower.includes('bdt')) target = 'BDT';

  const convertedRows = dbResult.rows.map((row: any[]) => {
    const idx = row.findIndex(v => typeof v === 'number');
    if (idx === -1) return row;
    const converted = await convertCurrency(row[idx], 'USD', target);
    const newRow = [...row];
    newRow[idx] = parseFloat(converted.toFixed(2));
    return newRow;
  });

  return { rows: convertedRows, columns: dbResult.columns };
}
