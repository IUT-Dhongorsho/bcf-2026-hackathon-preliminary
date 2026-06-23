import { config } from 'dotenv';
config();

// Required environment variables (must be set)
const required = [
  'PORT',
  'GROQ_API_KEY',
] as const;

// Optional variables with defaults
const optional = {
  DB_HOST: 'localhost',
  DB_PORT: '5433',
  DB_NAME: 'bcf_db',
  DB_USER: 'bcf',
  DB_PASSWORD: 'bcf2026',
  DATABASE_URL: '',
  SUPABASE_URL: '',
  SUPABASE_SERVICE_ROLE_KEY: '',
  JWT_SECRET: '',
} as const;

type Env = Record<typeof required[number], string> & Partial<Record<keyof typeof optional, string>>;

const env = {} as Env;

// Validate required
for (const key of required) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  env[key] = value;
}

// Load optional with defaults
for (const [key, defaultValue] of Object.entries(optional)) {
  env[key as keyof typeof optional] = process.env[key] || defaultValue;
}

export default env;
