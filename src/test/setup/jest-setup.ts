// import mongoose from 'mongoose';
import { CONTAINER_NAME, isContainerRunning, setupMongoContainer } from './docker';

const testDatabaseConfig = {
  user: 'test',
  password: 'test',
  port: '27018',
  database: 'testdb',
};

export const setup = async () => {
  const isRunning = await isContainerRunning(CONTAINER_NAME);
  if (!isRunning) {
    // eslint-disable-next-line max-len
    await setupMongoContainer(testDatabaseConfig.user, testDatabaseConfig.password, testDatabaseConfig.port);
  }
};

export default testDatabaseConfig;
