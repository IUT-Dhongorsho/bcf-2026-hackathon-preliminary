import express from 'express';
import dotenv from 'dotenv';
import { pool } from './config/database.js';
import { handleQuery } from './controllers/queryController.js';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;

// Health check endpoint
app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// Query endpoint
app.post('/query', handleQuery);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});