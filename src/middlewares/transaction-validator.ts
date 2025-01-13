/* eslint-disable @typescript-eslint/no-explicit-any */
import Joi, { Schema } from 'joi';
import { Request, Response, NextFunction } from 'express';

import createTransactionSchema from '../validators/transaction-validator';

// Use map and Object.fromEntries to create formatted error
const formatJoiError = (error: Joi.ValidationError): Record<string, string> =>
  // eslint-disable-next-line implicit-arrow-linebreak
  Object.fromEntries(error.details.map((detail) => [detail.path.join('.'), detail.message]));

const validateFn = <T extends Record<string, any>>(
  schema: Schema<T>,
  data: any,
  req: Request,
  res: Response,
  next: NextFunction,
): Response | void => {
  const { error, value } = schema.validate(data);

  if (error) {
    return res.status(400).json(formatJoiError(error));
  }

  // Use spread to create a new object instead of mutating
  if (req.body === data) {
    req.body = { ...value } as T;
  } else {
    req.params = { ...value } as T;
  }

  return next();
};

// Middleware for transaction creation validation
const validateCreateTransaction = (req: Request, res: Response, next: NextFunction): void => {
  validateFn(createTransactionSchema, req.body, req, res, next);
};

export default validateCreateTransaction;
