import express from 'express';

import { authMiddleware } from '../middlewares/auth';
import { createCommodity } from '../controllers/commodity-controller';

const router = express.Router();

router.post('/commodities', authMiddleware, createCommodity);

export default router;
