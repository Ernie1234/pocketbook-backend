import express from 'express';
import supertest from 'supertest';
import mongoose, { Connection } from 'mongoose';
import { Server, createServer } from 'node:http';

import { testDatabaseConfig } from './setup/jest-setup';
import logger from '../logs/logger';
import userRoute from '../routes/user-route';
import commodityRoute from '../routes/commodity-route';
import portfolioRoute from '../routes/portfolio-route';
import transactionRoute from '../routes/transaction-route';

const MONGO_URL = `mongodb://${testDatabaseConfig.user}:${testDatabaseConfig.password}@localhost:${testDatabaseConfig.port}/${testDatabaseConfig.database}?authSource=admin`;

class TestFactory {
  private _app!: express.Application;

  private _connection!: Connection;

  private _server!: Server;

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
      const connection = await mongoose.connect(MONGO_URL);
      this._connection = connection.connection;
      this._app = express();
      this._app.use(express.json());
      this._app.use(express.urlencoded({ extended: true }));
      this._app.use('/api/v1', userRoute);
      this._app.use('/api/v1', commodityRoute);
      this._app.use('/api/v1', portfolioRoute);
      this._app.use('/api/v1', transactionRoute);
      this._server = createServer(this._app).listen(3010);
    } catch (error) {
      logger.error(error);
      throw new Error(`Error starting up the server: ${error}`);
    }
  }

  private async clearDatabase() {
    const { collections } = this._connection;

    const deletePromises = Object.keys(collections).map(async (key) => {
      try {
        await collections[key].deleteMany({});
      } catch (error) {
        logger.error(`Failed to clear collection ${key}: ${error}`);
      }
    });

    await Promise.all(deletePromises);
  }
}

// Exporting TestFactory as the default export
export default TestFactory;
