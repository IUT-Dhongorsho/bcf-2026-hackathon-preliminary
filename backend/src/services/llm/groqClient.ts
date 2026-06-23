import Groq from 'groq-sdk';
import env from '../../config/env.js';

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

export async function generateGroqResponse(
  prompt: string,
  systemPrompt?: string,
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  const messages: Array<{ role: string; content: string }> = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: messages as any,
    temperature: options.temperature || 0.7,
    max_tokens: options.maxTokens || 1500,
  });

  return completion.choices[0]?.message?.content || '';
}
