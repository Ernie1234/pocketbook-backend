import { Request, Response, NextFunction } from 'express';
import Joi, { Schema } from 'joi';

import {
  emailVerificationSchema,
  forgetPasswordSchema,
  resendCodeSchema,
  resetPasswordSchema,
  signInUserSchema,
  signUpUserSchema,
} from '../validators/user-validator';

const formatJoiError = (error: Joi.ValidationError) => {
  const formattedError: { [key: string]: string } = {};
  // eslint-disable-next-line unicorn/no-array-for-each
  error.details.forEach((detail: Joi.ValidationErrorItem) => {
    formattedError[detail.path.join('.')] = detail.message;
  });
  return formattedError;
};

const validateFn = <T>(schema: Schema<T>, req: Request, res: Response, next: NextFunction) => {
  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).send(formatJoiError(error));
  }
  req.body = value as T;
  return next();
};

export const validateUserSignUp = async (req: Request, res: Response, next: NextFunction) => {
  validateFn(signUpUserSchema, req, res, next);
};
export const validateUserResend = async (req: Request, res: Response, next: NextFunction) => {
  validateFn(resendCodeSchema, req, res, next);
};
export const validateVerificationCode = async (req: Request, res: Response, next: NextFunction) => {
  validateFn(emailVerificationSchema, req, res, next);
};

export const validateUserSignIn = async (req: Request, res: Response, next: NextFunction) => {
  validateFn(signInUserSchema, req, res, next);
};

export const validateForgetPassword = async (req: Request, res: Response, next: NextFunction) => {
  validateFn(forgetPasswordSchema, req, res, next);
};

export const validateResetPassword = async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.params;
  const { password } = req.body;

  const { error } = resetPasswordSchema.validate({ token, password });

  if (error) {
    return res.status(400).send(formatJoiError);
  }
  return next();
};
