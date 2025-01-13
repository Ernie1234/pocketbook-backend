import { Request, Response, NextFunction } from 'express';
import Joi, { Schema, ValidationError } from 'joi';

import {
  emailVerificationSchema,
  forgetPasswordSchema,
  resendCodeSchema,
  resetPasswordSchema,
  signInUserSchema,
  signUpUserSchema,
} from '../validators/user-validator';

const formatJoiError = (error: ValidationError) => {
  const errors: Record<string, string> = {};
  error.details.forEach((detail) => {
    const key = detail.path[0] as string;
    errors[key] = detail.message;
  });
  return errors;
};

const validateFn = <T>(schema: Schema<T>, req: Request, res: Response, next: NextFunction) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).send(formatJoiError(error));
  }
  req.body = value as T;
  return next();
};

export const validateUserSignUp = async (req: Request, res: Response, next: NextFunction) => {
  return validateFn(signUpUserSchema, req, res, next);
};

export const validateUserResend = async (req: Request, res: Response, next: NextFunction) => {
  return validateFn(resendCodeSchema, req, res, next);
};

export const validateVerificationCode = async (req: Request, res: Response, next: NextFunction) => {
  return validateFn(emailVerificationSchema, req, res, next);
};

export const validateUserSignIn = async (req: Request, res: Response, next: NextFunction) => {
  return validateFn(signInUserSchema, req, res, next);
};

export const validateForgetPassword = async (req: Request, res: Response, next: NextFunction) => {
  return validateFn(forgetPasswordSchema, req, res, next);
};

export const validateResetPassword = async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.params;
  const { password } = req.body;
  return validateFn(resetPasswordSchema, { body: { token, password } } as Request, res, next);
};
