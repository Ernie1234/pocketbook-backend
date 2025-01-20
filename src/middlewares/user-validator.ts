/* eslint-disable indent */
/* eslint-disable max-len */
/* eslint-disable implicit-arrow-linebreak */
import { Request, Response, NextFunction, RequestHandler } from 'express';
import Joi, { Schema } from 'joi';

import {
  emailVerificationSchema,
  forgetPasswordSchema,
  resendCodeSchema,
  resetPasswordSchema,
  signInUserSchema,
  signUpUserSchema,
} from '../validators/user-validator';

const formatJoiError = (error: Joi.ValidationError): Record<string, string> =>
  // eslint-disable-next-line implicit-arrow-linebreak
  Object.fromEntries(error.details.map((detail) => [detail.path.join('.'), detail.message]));
// eslint-disable-next-line operator-linebreak
const validateFn =
  <T>(schema: Schema<T>): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      res.status(400).send(formatJoiError(error));
      return;
    }
    req.body = value as T;
    next();
  };

export const validateUserSignUp: RequestHandler = validateFn(signUpUserSchema);
export const validateUserResend: RequestHandler = validateFn(resendCodeSchema);
export const validateVerificationCode: RequestHandler = validateFn(emailVerificationSchema);
export const validateUserSignIn: RequestHandler = validateFn(signInUserSchema);
export const validateForgetPassword: RequestHandler = validateFn(forgetPasswordSchema);

export const validateResetPassword: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.params;
  const { password } = req.body;
  const { error, value } = resetPasswordSchema.validate({ token, password }, { abortEarly: false });

  if (error) {
    res.status(400).send(formatJoiError(error));
    return;
  }

  req.body = value;
  next();
};
