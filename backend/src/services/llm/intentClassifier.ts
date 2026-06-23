import { generateGroqResponse } from './groqClient.js';

type Intent = 'database' | 'external' | 'mixed';

export async function classifyIntent(question: string): Promise<Intent> {
  // Quick keyword check first (faster)
  const lower = question.toLowerCase();
  if (lower.includes('convert') && (lower.includes('eur') || lower.includes('euro') || lower.includes('gbp') || lower.includes('pound'))) {
    return 'mixed';
  }
  if (lower.includes('convert') || lower.includes('currency') || lower.includes('latitude') || lower.includes('longitude') || lower.includes('weather')) {
    return 'external';
  }

  // If ambiguous, use LLM
  const prompt = `
Classify the following question into one of three categories:

1. "database" → answer comes purely from the PostgreSQL database (e.g., "total revenue", "top customers").
2. "external" → answer comes purely from an external API (e.g., currency conversion, geocoding).
3. "mixed" → answer requires both database and external API (e.g., "convert total revenue to EUR").

Question: "${question}"

Answer ONLY with one word: database, external, or mixed.`;

  const result = await generateGroqResponse(prompt, undefined, { temperature: 0.1, maxTokens: 10 });
  const clean = result.trim().toLowerCase();
  if (clean === 'external' || clean === 'mixed' || clean === 'database') {
    return clean;
  }
  return 'database'; // fallback
}
