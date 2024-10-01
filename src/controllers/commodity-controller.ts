import { Request, Response } from 'express';

import { serverErrorMsg, invalidCredentialsMsg } from '../constants/messages';
import HTTP_STATUS from '../utils/http-status';
import logger from '../logs/logger';
import User from '../models/user';
import { generateTokenAndSetCookies } from '../utils/generate-functions';

//  LOGIN OR SIGNIN USER
export const createCommodity = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({
      email,
    });
    if (!user) {
      logger.error(invalidCredentialsMsg);
      return res.status(HTTP_STATUS.BAD_REQUEST).send({ message: invalidCredentialsMsg });
    }

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Sign-in successful',
      user: {
        password: undefined,
      },
    });
  } catch (error) {
    logger.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({ message: serverErrorMsg });
  }
};
