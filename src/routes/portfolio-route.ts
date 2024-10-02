import express from 'express';

import { authMiddleware } from '../middlewares/auth';
import { getPortfolio } from '../controllers/portfolio-controller';

const router = express.Router();

router.get('/portfolio', authMiddleware, getPortfolio);

export default router;
