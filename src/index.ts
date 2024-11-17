import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import logger from './logs/logger';
import userRoute from './routes/user-route';
import commodityRoute from './routes/commodity-route';
import portfolioRoute from './routes/portfolio-route';
import transactionRoute from './routes/transaction-route';
import connectDb from './db/connect';

dotenv.config();
const app = express();
const port = process.env.PORT || 8000;

const allowedOrigins = [
  process.env.REACT_WEB_APP_BASE_URL as string, // React web app
  process.env.REACT_WEB_APP_PROD_BASE_URL as string, // Production React web app
  process.env.REACT_NATIVE_APP_BASE_URL as string, // Replace with your React Native server endpoint
  process.env.EXPO_BASE_URL!, // If using Expo
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Express & TypeScript Server');
});
app.get('/healthz', (req: Request, res: Response) => {
  res.send('Working in good health');
});

app.use('/api/v1', userRoute);
app.use('/api/v1', commodityRoute);
app.use('/api/v1', portfolioRoute);
app.use('/api/v1', transactionRoute);

const start = async () => {
  try {
    await connectDb(process.env.DATABASE_URI || '');
    app.listen(port, () => {
      logger.info(`Server is started at port: http://localhost:${port}`);
    });
  } catch (error) {
    logger.error(error);
  }
};

start();
