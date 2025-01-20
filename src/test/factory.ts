import express, { Request, Response, NextFunction, Express } from 'express';
import supertest from 'supertest';
import mongoose, { Connection } from 'mongoose';
import { Server, createServer } from 'node:http';
import cookieParser from 'cookie-parser';

import logger from '../logs/logger';
import userRoute from '../routes/user-route';
import commodityRoute from '../routes/commodity-route';
import portfolioRoute from '../routes/portfolio-route';
import transactionRoute from '../routes/transaction-route';
import testDatabaseConfig from './setup/jest-setup';

const MONGO_URL = `mongodb://${testDatabaseConfig.user}:${testDatabaseConfig.password}@localhost:${testDatabaseConfig.port}/${testDatabaseConfig.database}?authSource=admin`;

class TestFactory {
  private _app!: Express;

  private _connection!: Connection;

  private _server!: Server;

  private _port: number;

  constructor() {
    // Generate a random port between 3000 and 4000
    this._port = Math.floor(Math.random() * 1000) + 3000;
  }

  public get app(): supertest.SuperTest<supertest.Test> {
    return supertest(this._app) as unknown as supertest.SuperTest<supertest.Test>;
  }

  public async init(): Promise<void> {
    await this.startup();
    await this.clearDatabase(); // Ensure the database is clean before tests
  }

  public async close(): Promise<void> {
    await this.clearDatabase(); // Optionally clear the database on close
    await this._connection.close();
    this._server.close();
  }

  private async startup() {
    try {
      // Set test environment variables first
      process.env.NODE_ENV = 'test';
      process.env.JWT_SECRET = 'test-secret';
      process.env.EMAIL_USER = 'test@example.com';
      process.env.EMAIL_PASS = 'test-password';
      process.env.EMAIL_HOST = 'smtp.example.com';
      process.env.EMAIL_PORT = '587';
      process.env.EMAIL_FROM = 'test@example.com';
      process.env.FRONTEND_BASE_URL = 'http://localhost:3000';

      // Connect to test database with retry logic
      await this.connectWithRetry(5, 1000);

      // Create Express app
      this._app = express();

      // Configure middleware
      this._app.use(express.json());
      this._app.use(cookieParser());
      this._app.use(express.urlencoded({ extended: true }));

      // Configure response headers
      this._app.use((req: Request, res: Response, next: NextFunction) => {
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        next();
      });

      // Configure routes
      this._app.use('/api/v1/users', userRoute);
      this._app.use('/api/v1', commodityRoute);
      this._app.use('/api/v1', portfolioRoute);
      this._app.use('/api/v1', transactionRoute);

      // Start server
      this._server = createServer(this._app).listen(this._port);

      logger.info(`Test server started on port ${this._port}`);
    } catch (error) {
      logger.error('Error in test setup:', error);
      throw error;
    }
  }

  private connectWithRetry(maxRetries: number, delay: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const attemptConnection = async (retriesLeft: number) => {
        if (retriesLeft === 0) {
          reject(new Error('Failed to connect to MongoDB after multiple attempts'));
          return;
        }

        try {
          const connection = await mongoose.connect(MONGO_URL);
          this._connection = connection.connection;
          resolve();
        } catch (error) {
          logger.info(`Failed to connect to MongoDB, retrying... (${retriesLeft} attempts left): ${error}`);
          setTimeout(() => attemptConnection(retriesLeft - 1), delay);
        }
      };

      attemptConnection(maxRetries);
    });
  }

  private async clearDatabase() {
    const { collections } = this._connection;

    await Promise.all(
      Object.keys(collections).map(async (key) => {
        try {
          await collections[key].deleteMany({});
        } catch (error) {
          logger.error(`Failed to clear collection ${key}: ${error}`);
        }
      }),
    );
  }
}

// Exporting TestFactory as the default export
export default TestFactory;
