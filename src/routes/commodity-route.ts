import express from 'express';

import { createCommodity, getAllCommodities, getCommodityBySlug } from '../controllers/commodity-controller';
import { validateCommoditySlug, validateCreateCommodity } from '../middlewares/commodity-validator';
import { authMiddleware } from '../middlewares/auth';

const router = express.Router();

router.post('/commodities', authMiddleware, validateCreateCommodity, createCommodity);
router.get('/commodities', authMiddleware, getAllCommodities);
router.get('/commodities/:slug', authMiddleware, validateCommoditySlug, getCommodityBySlug);

export default router;
