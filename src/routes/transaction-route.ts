import express from 'express';

import { authMiddleware } from '../middlewares/auth';
import { createTransaction, getAllTransactions } from '../controllers/transaction-controller';
import validateCreateTransaction from '../middlewares/transaction-validator';

const router = express.Router();

router.post('/transactions', authMiddleware, validateCreateTransaction, async (req, res, next) => {
  try {
    await createTransaction(req, res);
  } catch (error) {
    next(error);
  }
});
router.get('/transactions', authMiddleware, async (req, res, next) => {
  try {
    await getAllTransactions(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
