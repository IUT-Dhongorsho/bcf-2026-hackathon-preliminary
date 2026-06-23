import { generateGroqResponse } from './groqClient.js';
import { getSchema } from '../database/executor.js';

export async function generateSQL(question: string): Promise<string> {
  const schema = await getSchema();

  const prompt = `
You are a PostgreSQL expert. Given the database schema below, generate a **single SQL query** that answers the user's question.

Database Schema:
${schema}

Question: ${question}

Instructions:
- Output ONLY the SQL query, no explanation, no markdown, no backticks.
- Use column names exactly as shown.
- Use ONLY SELECT statements.
- For TEXT or VARCHAR columns, ALWAYS use ILIKE instead of '=' for case-insensitive string matching (e.g. status ILIKE 'paid').
- For BOOLEAN, NUMERIC, or DATE columns, use standard operators (e.g. is_active = true).
- ALWAYS prefix column names with their table aliases (e.g., p.product_id) to avoid ambiguous column errors.
- DO NOT use any tables or columns that are not explicitly listed in the schema.
- If the question asks to "convert" currencies, IGNORE the currency conversion part and just return the raw database values. The backend handles currency math separately.
- If the question asks for a total, use SUM() and appropriate JOINs.
- If the question asks for a single value, return a scalar.
- If the question asks for one row, use LIMIT 1.
- For date ranges, use NOW() or CURRENT_DATE - INTERVAL 'N days'.

SQL Query:`;

  const sql = await generateGroqResponse(prompt, undefined, { temperature: 0.2, maxTokens: 500 });

  // Clean up: remove markdown, backticks, extra whitespace
  let clean = sql.trim();
  clean = clean.replace(/```sql/g, '').replace(/```/g, '').trim();
  if (clean.endsWith(';')) clean = clean.slice(0, -1);
  return clean;
}
