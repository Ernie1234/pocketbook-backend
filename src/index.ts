import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import logger from './logs/logger';
import authRoute from './routes/auth-route';
import connectDb from './db/connect';

dotenv.config();
const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Express & TypeScript Server');
});
app.use('/api/v1', authRoute);

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
