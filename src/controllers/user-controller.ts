import { Request, Response } from 'express';
import bcryptjs from 'bcryptjs';

import {
  createdMsg,
  invalidCredentialsMsg,
  invalidTokenMsg,
  serverErrorMsg,
  userAlreadyExist,
} from '../constants/messages';
import HTTP_STATUS from '../utils/http-status';
import logger from '../logs/logger';
import User from '../models/user';
import { generateTokenAndSetCookies, generateVerificationToken } from '../utils/generate-functions';
import { sendVerificationEmail, sendWelcomeEmail } from '../mails/emails';
import { IUser } from '../utils/types';

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
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({ message: serverErrorMsg });
  }
};

//  VERIFY USER EMAIL
export const verifyEmail = async (req: Request, res: Response): Promise<Response> => {
  const { verificationCode } = req.body;

  try {
    // Find user with the provided verification code and check if the token is not expired
    const userCode: IUser | null = await User.findOne({
      verificationToken: verificationCode,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    logger.info(userCode);

    if (!userCode) {
      logger.error(invalidTokenMsg);
      return res.status(HTTP_STATUS.BAD_REQUEST).send({
        success: false,
        message: invalidTokenMsg,
      });
    }

    // Update user verification status
    userCode.isVerified = true;
    userCode.verificationToken = undefined;
    userCode.verificationTokenExpiresAt = undefined;
    await userCode.save();

    // Send welcome email
    if (userCode.email && userCode.name) {
      await sendWelcomeEmail(userCode.email, userCode.name);
    }

    const userObject = userCode.toObject();

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Email verified successfully',
      user: {
        ...userObject,
        password: undefined,
      },
    });
  } catch (error) {
    logger.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: serverErrorMsg,
    });
  }
};

//  LOGIN OR SIGNIN USER
export const signInUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({
      email,
    });
    if (!user) {
      logger.error(invalidCredentialsMsg);
      return res.status(HTTP_STATUS.BAD_REQUEST).send({ message: invalidCredentialsMsg });
    }

    // Ensure user.password is a string before comparing
    if (typeof user.password !== 'string') {
      logger.error('User password is not a string');
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: serverErrorMsg,
      });
    }
    // Compare provided password with stored hashed password
    const isMatch = await bcryptjs.compare(password, user.password);

    if (!isMatch) {
      logger.error(invalidCredentialsMsg);
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: invalidCredentialsMsg,
      });
    }

    // Generate token and set cookies (assuming a function exists for this)
    generateTokenAndSetCookies(res, user.id);
    user.lastLogin = new Date();

    await user.save();

    const userObject = user.toObject();

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Sign-in successful',
      user: {
        ...userObject,
        password: undefined,
      },
    });
  } catch (error) {
    logger.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({ message: serverErrorMsg });
  }
};

//  LOGOUT USER
export const logOutUser = async (req: Request, res: Response) => {
  try {
    res.clearCookie('token'); // Clear the token cookie
    return res.status(HTTP_STATUS.OK).send({ success: true, message: 'Logout successful' });
  } catch (error) {
    logger.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({ message: serverErrorMsg });
  }
};
