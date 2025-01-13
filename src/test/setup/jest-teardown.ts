import { removeMongoContainer } from './docker';

const jestTeardown = async () => {
  await removeMongoContainer();
};

export default jestTeardown;
