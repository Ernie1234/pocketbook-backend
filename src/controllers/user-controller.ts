import { Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import CryptoJS from 'crypto-js';

import {
  createdMsg,
  invalidCredentialsMsg,
  invalidTokenMsg,
  noUserMsg,
  serverErrorMsg,
  successMsg,
  userAlreadyExist,
} from '../constants/messages';
import HTTP_STATUS from '../utils/http-status';
import logger from '../logs/logger';
import User from '../models/user';
import { generateTokenAndSetCookies, generateVerificationToken } from '../utils/generate-functions';
import {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from '../mails/emails';
import { IUser } from '../utils/types';

//  CREATE/SIGN-UP OR REGISTER A USER
export const signUpUser = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    const name = `${firstName} ${lastName}`;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.error(userAlreadyExist);
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: userAlreadyExist,
      });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const verificationToken = generateVerificationToken();

    const user = new User({
      email,
      name,
      verificationToken,
      password: hashedPassword,
      verificationTokenExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
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
        password: undefined,
        verificationToken,
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

//   RESEND VERIFICATION CODE TO USER
export const resendCode = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({
      email,
    });
    if (!user) {
      logger.error(invalidCredentialsMsg);
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: invalidCredentialsMsg,
      });
    }

    const verificationToken = generateVerificationToken();
    user.verificationToken = verificationToken;
    user.verificationTokenExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(user.email as string, verificationToken);

    logger.info(`Verification code resent to user: ${user.id}`);

    const userObject = user.toObject();

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Verification code sent successfully',
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

//  VERIFY USER EMAIL
export const verifyEmail = async (req: Request, res: Response): Promise<Response> => {
  const { verificationCode } = req.body;

  try {
    // Find user with the provided verification code and check if the token is not expired
    const userCode: IUser | null = await User.findOne({
      verificationToken: verificationCode,
      verificationTokenExpiresAt: { $gt: new Date() },
    });

    logger.info(userCode);

    if (!userCode) {
      logger.error(invalidTokenMsg);
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
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
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: invalidCredentialsMsg,
      });
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

    // Generate token and set cookies
    const token = generateTokenAndSetCookies(res, user.id);
    logger.info('Generated token and set cookies:', token);

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
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: serverErrorMsg,
    });
  }
};

//  LOGOUT USER
export const logOutUser = async (req: Request, res: Response) => {
  try {
    res.clearCookie('token'); // Clear the token cookie
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    logger.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: serverErrorMsg,
    });
  }
};
//  FORGET PASSWORD
export const forgetPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      logger.error(noUserMsg);
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: noUserMsg,
      });
    }

    // Generate reset token
    const resetToken = CryptoJS.lib.WordArray.random(32).toString(); // Generate a random token

    // Save the hashed token and its expiration time (30 minutes)
    user.resetPasswordToken = resetToken; // Ensure your User model has this field
    user.resetPasswordExpires = new Date(Date.now() + 3_600_000); // 1 hour from now
    await user.save();

    // Send the password reset email
    const resetURL = `${process.env.FRONTEND_BASE_URL}/reset-password/${resetToken}`;
    await sendPasswordResetEmail(email, resetURL); // Implement this function to send the email

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Password reset link sent to your email!',
    });
  } catch (error) {
    logger.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: serverErrorMsg,
    });
  }
};

//  RESET USER PASSWORD
export const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: invalidTokenMsg,
      });
    }

    const hashedpassword = await bcryptjs.hash(password, 10);

    user.password = hashedpassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    await sendResetSuccessEmail(user.email as string);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Password reset ${successMsg}`,
    });
  } catch (error) {
    logger.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: serverErrorMsg,
    });
  }
};
