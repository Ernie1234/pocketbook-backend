import { Request, Response } from 'express';
import bcryptjs from 'bcryptjs';

import { createdMsg, userAlreadyExist } from '../constants/messages';
import HTTP_STATUS from '../utils/http-status';
import logger from '../logs/logger';
import User from '../models/user';
import { generateTokenAndSetCookies, generateVerificationToken } from '../utils/generate-functions';
import { sendVerificationEmail } from '../mails/emails';

//  CREATE/SIGN-UP OR REGISTER A USER
export const signUpUser = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.error(userAlreadyExist);
      return res.status(HTTP_STATUS.CONFLICT).send({ message: userAlreadyExist });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const verificationToken = generateVerificationToken();

    const user = new User({
      email,
      name,
      verificationToken,
      password: hashedPassword,
      verificationTokenExpiresAt: Date.now() + 5 * 60 * 1000,
    });

    await user.save();
    const userObject = user.toObject();

    generateTokenAndSetCookies(res, user.id);
    await sendVerificationEmail(user?.email as string, verificationToken);

    logger.info(`User created: ${user.id}`);

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: createdMsg,
      user: {
        ...userObject,
        password: undefined, // Do not send password back in the response
      },
    });
  } catch (error) {
    logger.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({ message: 'Error adding url' });
  }
};

//  LOGIN OR SIGNIN USER
export const signInUser = async (req: Request, res: Response) => {
  try {
    logger.info('get all users');
    return res.status(HTTP_STATUS.OK);
  } catch (error) {
    logger.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({ message: 'Error getting url' });
  }
};

//  LOGOUT USER
export const logOutUser = async (req: Request, res: Response) => {
  try {
    res.clearCookie('token'); // Clear the token cookie
    return res.status(HTTP_STATUS.OK).send({ message: 'Logout successful' });
  } catch (error) {
    logger.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({ message: 'Error logging out' });
  }
};
