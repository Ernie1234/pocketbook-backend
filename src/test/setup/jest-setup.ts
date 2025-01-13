import mongoose from 'mongoose';
import { CONTAINER_NAME, isContainerRunning, setupMongoContainer } from './docker';

const testDatabaseConfig = {
  user: 'test',
  password: 'test',
  port: '27018',
  database: 'testdb',
};

beforeAll(async () => {
  const isRunning = await isContainerRunning(CONTAINER_NAME);
  if (!isRunning) {
    // eslint-disable-next-line max-len
    await setupMongoContainer(testDatabaseConfig.user, testDatabaseConfig.password, testDatabaseConfig.port);
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});

export default testDatabaseConfig;
