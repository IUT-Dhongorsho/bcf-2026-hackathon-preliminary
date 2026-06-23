import { Request, Response } from 'express';
import { classifyIntent } from '../services/llm/intentClassifier.js';
import { queryQueue } from '../services/queue/queryWorker.js';

export const handleQuery = async (req: Request, res: Response) => {
  try {
    const { question, llm = 'groq-llama-3.3-70b' } = req.body;
    if (!question) return res.status(400).json({ error: 'Missing "question"' });

    // 1. Classify intent (fast, no heavy processing)
    const intent = await classifyIntent(question);

    // 2. Add to queue for async processing
    const job = await queryQueue.add('query', {
      question,
      llm,
      intent,
    });

    // 3. Wait for the job to complete (with timeout)
    const result = await job.waitUntilFinished(
      queryQueue, // worker instance
      30000 // 30 second timeout
    );

    res.json(result);
  } catch (error: any) {
    if (error.message?.includes('timeout')) {
      return res.status(408).json({ error: 'Query timed out. Please try again.' });
    }
    console.error('Query error:', error);
    res.status(500).json({ error: error.message || 'Internal error' });
  }
};
