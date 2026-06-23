import { Pool } from 'pg'
import env from '../config/env.js'

export const db = new Pool({
  host: env.DB_HOST || 'localhost',
  port: parseInt(env.DB_PORT || '5433') || 5433,
  database: env.DB_NAME || 'bcf_db',
  user: env.DB_USER || 'bcf',
  password: env.DB_PASSWORD || 'bcf2026',
  onConnect: async (client) => {
      console.log('Connected to the database')
  },
})
