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

router.post(
  commodityUrl,
  authMiddleware,
  async (req, res, next) => {
    try {
      await validateCreateCommodity(req, res, next);
    } catch (error) {
      next(error);
    }
  },
  async (req, res, next) => {
    try {
      await createCommodity(req, res);
    } catch (error) {
      next(error);
    }
  },
);
router.get(commodityUrl, authMiddleware, async (req, res, next) => {
  try {
    await getAllCommodities(req, res);
  } catch (error) {
    next(error);
  }
});
router.get(
  `${commodityUrl}/:slug`,
  authMiddleware,
  async (req, res, next) => {
    try {
      await validateCommoditySlug(req, res, next);
    } catch (error) {
      next(error);
    }
  },
  async (req, res, next) => {
    try {
      await getCommodityBySlug(req, res);
    } catch (error) {
      next(error);
    }
  },
);
router.get(
  `${commodityUrl}/:commodityName`,
  authMiddleware,
  async (req, res, next) => {
    try {
      await validateCommodityName(req, res, next);
    } catch (error) {
      next(error);
    }
  },
  async (req, res, next) => {
    try {
      await getCommodityByName(req, res);
    } catch (error) {
      next(error);
    }
  },
);
router.put(
  commodityUrl,
  authMiddleware,
  async (req, res, next) => {
    try {
      await validateCommodityUpdate(req, res, next);
    } catch (error) {
      next(error);
    }
  },
  async (req, res, next) => {
    try {
      await updateCommodity(req, res);
    } catch (error) {
      next(error);
    }
  },
);
router.delete(
  `${commodityUrl}/:slug`,
  authMiddleware,
  async (req, res, next) => {
    try {
      await validateCommoditySlug(req, res, next);
    } catch (error) {
      next(error);
    }
  },
  async (req, res, next) => {
    try {
      await deleteCommodityBySlug(req, res);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
