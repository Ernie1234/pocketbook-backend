import express from 'express';

import {
  createCommodity,
  deleteCommodityBySlug,
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

const commodityUrl = '/commodities';

router.post(commodityUrl, authMiddleware, validateCreateCommodity, createCommodity);
router.get(commodityUrl, authMiddleware, getAllCommodities);
router.get(`${commodityUrl}/:slug`, authMiddleware, validateCommoditySlug, getCommodityBySlug);
router.get(`${commodityUrl}/:commodityName`, authMiddleware, validateCommodityName, getCommodityByName);
router.put(commodityUrl, authMiddleware, validateCommodityUpdate, updateCommodity);
router.delete(`${commodityUrl}/:slug`, authMiddleware, validateCommoditySlug, deleteCommodityBySlug);

export default router;
