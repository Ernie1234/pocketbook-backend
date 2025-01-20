import express from 'express';

import { authMiddleware } from '../middlewares/auth';
import getPortfolio from '../controllers/portfolio-controller';

const router = express.Router();

router.get('/portfolio', authMiddleware, async (req, res, next) => {
  try {
    await getPortfolio(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
