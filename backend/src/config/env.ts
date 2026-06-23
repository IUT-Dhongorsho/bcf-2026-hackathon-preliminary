import { config } from 'dotenv';
config();

// Required environment variables (must be set)
const required = [
  'PORT',
  'DATABASE_URL',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET',
  'GROQ_API_KEY',
] as const;

// Optional variables with defaults
const optional = {
  REDIS_URL: 'redis://localhost:6379',
  CLIENT_URL: '*',
  DEFAULT_CHUNK_SIZE: '500',
  DEFAULT_CHUNK_OVERLAP: '50',
  DEFAULT_TOP_K: '5',
  ELEVENLABS_API_KEY: '',
  DEFAULT_VOICE_ID: '21m00Tcm4TlvDq8ikWAM',
  SERPAPI_KEY: '',
  GOOGLE_VISION_API_KEY: '',
  RESEND_API_KEY: '',
  TWILIO_ACCOUNT_SID: '',
  TWILIO_AUTH_TOKEN: '',
  ENABLE_WEBSOCKETS: 'true',
  ENABLE_RAG: 'true',
  ENABLE_TTS: 'true',
  ENABLE_OCR: 'true',
  ENABLE_NER: 'true',
  ENABLE_TRANSLATION: 'true',
  ENABLE_ANOMALY: 'true',
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
