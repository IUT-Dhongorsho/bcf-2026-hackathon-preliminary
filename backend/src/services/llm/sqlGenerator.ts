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
