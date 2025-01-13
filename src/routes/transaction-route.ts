import express from 'express';

import { authMiddleware } from '../middlewares/auth';
import { createTransaction, getAllTransactions } from '../controllers/transaction-controller';
import validateCreateTransaction from '../middlewares/transaction-validator';

const router = express.Router();

router.post('/transactions', authMiddleware, validateCreateTransaction, createTransaction);
router.get('/transactions', authMiddleware, getAllTransactions);

export default router;
