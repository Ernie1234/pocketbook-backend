import express from 'express';

import { authMiddleware } from '../middlewares/auth';
import { createTransaction } from '../controllers/transaction-controller';
import { validateCreateTransaction } from '../middlewares/transaction-validator';

const router = express.Router();

router.post('/transaction', authMiddleware, validateCreateTransaction, createTransaction);

export default router;
