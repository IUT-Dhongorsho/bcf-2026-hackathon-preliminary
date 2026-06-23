import * as express from 'express';
import * as cors from 'cors';
import { config } from 'dotenv';
config();

import healthRoutes from './routes/health.routes.js';
import queryRoutes from './routes/query.routes.js';
import { errorHandler } from './utils/errorHandler.js';
import './services/queue/queryWorker.js'; // start the worker

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json({ limit: '50mb' }));

app.use('/api', healthRoutes);
app.use('/api', queryRoutes);

app.use(errorHandler);

export default app;
