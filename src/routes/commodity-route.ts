import express from 'express';

import {
  createCommodity,
  getAllCommodities,
  getCommodityByName,
  getCommodityBySlug,
  updateCommodity,
} from '../controllers/commodity-controller';
import {
  validateCommodityName,
  validateCommoditySlug,
  validateCommodityUpdate,
  validateCreateCommodity,
} from '../middlewares/commodity-validator';
import { authMiddleware } from '../middlewares/auth';

const router = express.Router();

router.post('/commodities', authMiddleware, validateCreateCommodity, createCommodity);
router.get('/commodities', authMiddleware, getAllCommodities);
router.get('/commodities/:slug', authMiddleware, validateCommoditySlug, getCommodityBySlug);
router.get('/commodities/:commodityName', authMiddleware, validateCommodityName, getCommodityByName);
router.put('/commodities', authMiddleware, validateCommodityUpdate, updateCommodity);

export default router;
