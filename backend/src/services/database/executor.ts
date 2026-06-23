import { pool } from '../../config/database.js';

export async function getSchema(): Promise<string> {
  const query = `
    SELECT 
      t.table_name,
      c.column_name,
      c.data_type,
      c.is_nullable,
      (
        SELECT string_agg(
          DISTINCT tc.constraint_type || ' (' || kcu.column_name || ')', ', '
        )
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_name = kcu.table_name
        WHERE tc.table_name = t.table_name
          AND kcu.column_name = c.column_name
      ) AS constraints
    FROM information_schema.tables t
    JOIN information_schema.columns c
      ON t.table_name = c.table_name
    WHERE t.table_schema = 'public'
      AND t.table_type = 'BASE TABLE'
    ORDER BY t.table_name, c.ordinal_position;
  `;

  const result = await pool.query(query);
  const map: Record<string, string[]> = {};
  for (const row of result.rows) {
    if (!map[row.table_name]) map[row.table_name] = [];
    let col = `  ${row.column_name} ${row.data_type}`;
    if (row.constraints) col += ` (${row.constraints})`;
    map[row.table_name].push(col);
  }

  let str = '';
  for (const [table, cols] of Object.entries(map)) {
    str += `Table: ${table}\n${cols.join('\n')}\n\n`;
  }
  return str;
}

export async function executeSQL(sql: string): Promise<{ rows: any[]; columns: string[] }> {
  const trimmed = sql.trim().toUpperCase();
  if (!trimmed.startsWith('SELECT')) throw new Error('Only SELECT queries are allowed');

  const dangerous = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'CREATE', 'TRUNCATE'];
  for (const word of dangerous) {
    if (trimmed.includes(word)) throw new Error(`Forbidden keyword: ${word}`);
  }

  const client = await pool.connect();
  try {
    const result = await client.query(sql);
    return { rows: result.rows, columns: result.fields.map(f => f.name) };
  } finally {
    client.release();
  }
}
