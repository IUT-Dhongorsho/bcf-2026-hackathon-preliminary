import pg from 'pg';
import env from './env.js';

const { Pool } = pg;

export const pool = new Pool({
  host: env.DB_HOST || 'localhost',
  port: parseInt(env.DB_PORT || '5433'),
  database: env.DB_NAME || 'bcf_db',
  user: env.DB_USER || 'bcf',
  password: env.DB_PASSWORD || 'bcf2026',
});
