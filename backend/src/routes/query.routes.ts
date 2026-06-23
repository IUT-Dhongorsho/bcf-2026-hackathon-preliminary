import { Router } from 'express';
import { handleQuery } from '../controllers/queryController.js';

const router = Router();
router.post('/query', handleQuery);

export default router;
