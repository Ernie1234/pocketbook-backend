/* eslint-disable @typescript-eslint/no-explicit-any */

import { imageExists, pullImageAsync } from 'dockerode-utils';

import Docker from 'dockerode';
import logger from '../../logs/logger';

const CONTAINER_IMAGE = 'mongo:latest';
export const CONTAINER_NAME = 'pocket-book-test';

export const removeMongoContainer = async () => {
  const docker = new Docker();
  try {
    const container = docker.getContainer(CONTAINER_NAME);
    const containerInfo = await container.inspect();
    if (containerInfo) {
      if (containerInfo.State.Running) {
        await container.stop();
      }
      await container.remove({ v: true });
    }
  } catch (error: any) {
    if (error.statusCode === 404) {
      logger.info('Container not found, skipping removal.');
    } else {
      logger.error(error);
      throw error;
    }
  }
};

export const setupMongoContainer = async (user: string, password: string, port: string) => {
  const docker = new Docker();
  const needsToPullImage = !(await imageExists(docker, CONTAINER_IMAGE));

  if (needsToPullImage) {
    logger.info(`Pulling image ${CONTAINER_IMAGE}`);
    await pullImageAsync(docker, CONTAINER_IMAGE);
  }

  await removeMongoContainer();

  const container = await docker.createContainer({
    Env: [
      `MONGO_INITDB_ROOT_USERNAME=${user}`,
      `MONGO_INITDB_ROOT_PASSWORD=${password}`,
      'BASE_URL=https://pocketbook',
    ],
    Image: CONTAINER_IMAGE,
    name: CONTAINER_NAME,
    HostConfig: {
      PortBindings: {
        '27017/tcp': [{ HostPort: port }],
      },
    },
    ExposedPorts: {
      '27017/tcp': {},
    },
  });

  await container.start();
  return container;
};

export const isContainerRunning = async (containerName: string): Promise<boolean> => {
  const docker = new Docker();
  const containers = await docker.listContainers({ all: true });
  const containerInfo = containers.find(
    (container) => container.Names && container.Names.includes(`/${containerName}`),
  );
  return containerInfo ? containerInfo.State === 'running' : false;
};
