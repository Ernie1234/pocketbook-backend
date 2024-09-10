import { Request, Response } from 'express';

import { createdMsg } from '../constants/messages';
import HTTP_STATUS from '../utils/http-status';
import logger from '../logs/logger';

//  CREATE A USER
export const createUser = async (req: Request, res: Response) => {
  try {
    return res.status(HTTP_STATUS.CREATED).json({ message: createdMsg });
  } catch (error) {
    logger.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({ message: 'Error adding url' });
  }
};

//  GET ALL THE USERS
export const getUsers = async (req: Request, res: Response) => {
  try {
    console.log('get all users');
  } catch (error) {
    logger.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({ message: 'Error getting url' });
  }
};

//  GET A USER
export const getUser = async (req: Request, res: Response) => {
  try {
    console.log('get user');
  } catch (error) {
    logger.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({ message: 'Error occurred while fetching url' });
  }
};

// UPDATING A USER
export const updateUser = async (req: Request, res: Response) => {
  try {
    console.log('update user');
  } catch (error) {
    logger.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({ message: 'Error occurred while updating url' });
  }
};

// DELETING A USER
export const deleteUser = async (req: Request, res: Response) => {
  try {
    console.log('delete user');
  } catch (error) {
    logger.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({ message: 'Error occurred while deleting url' });
  }
};
