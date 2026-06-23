import { Worker, Queue } from 'bullmq';
import redis from '../../config/redis.js';
import { generateSQL } from '../llm/sqlGenerator.js';
import { executeSQL } from '../database/executor.js';
import { resolveExternalQuery } from '../external/index.js';
import { convertCurrency } from '../external/currency.js';
import { formatResponse } from '../response/formatter.js';

// Queue instance
export const queryQueue = new Queue('queryQueue', { connection: redis });

// Worker that processes jobs
export const queryWorker = new Worker(
  'queryQueue',
  async (job) => {
    const { question, llm, intent } = job.data;

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

    return formatResponse({ question, llm, columns, rows, source });
  },
  { connection: redis, concurrency: 5 }
);

// Mixed handler (fixed)
async function handleMixed(question: string) {
  const sql = await generateSQL(question);
  const dbResult = await executeSQL(sql);

  const lower = question.toLowerCase();
  let target = 'EUR';
  if (lower.includes('gbp') || lower.includes('pound')) target = 'GBP';
  else if (lower.includes('inr')) target = 'INR';
  else if (lower.includes('bdt')) target = 'BDT';

  // Fix: Use Promise.all for async mapping
  const convertedRows = await Promise.all(
    dbResult.rows.map(async (row: any[]) => {
      const idx = row.findIndex(v => typeof v === 'number');
      if (idx === -1) return row;
      const converted = await convertCurrency(row[idx], 'USD', target);
      const newRow = [...row];
      newRow[idx] = parseFloat(converted.toFixed(2));
      return newRow;
    })
  );

  return { rows: convertedRows, columns: dbResult.columns };
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  await queryWorker.close();
});
