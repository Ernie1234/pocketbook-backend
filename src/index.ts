import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import logger from './logs/logger';
import userRoute from './routes/user-route';
import connectDb from './db/connect';

dotenv.config();
const app = express();
const port = process.env.PORT || 8000;

// Define allowed origins
// TO BE REMOVED TO ENVIRONMENT VARIABLE!!!
// const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
const allowedOrigins = [
  'http://localhost:5173', // React web app
  'https://pocketbook-kohl.vercel.app/', // Production React web app
  'http://your-react-native-ip:port', // Replace with your React Native server endpoint
  'https://your-react-native-expo-url.com', // If using Expo
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
app.use('/api/v1', userRoute);

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
