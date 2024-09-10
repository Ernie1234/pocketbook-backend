import mongoose from 'mongoose';
import logger from '../logs/logger';

const connectDb = async (url: string) => {
  try {
    await mongoose.connect(url);
    logger.info('Database Connected Successfully');
  } catch (error) {
    logger.error(`Error Connecting to MongoDB: ${error}`);
  }
};

export default connectDb;
