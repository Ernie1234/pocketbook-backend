import { Request, Response, NextFunction } from 'express';
import Joi, { Schema } from 'joi';

import { createCommoditySchema, slugValidationSchema } from '../validators/commodity-validator';

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

export const validateCreateCommodity = async (req: Request, res: Response, next: NextFunction) => {
  validateFn(createCommoditySchema, req, res, next);
};
export const validateCommoditySlug = async (req: Request, res: Response, next: NextFunction) => {
  validateFn(slugValidationSchema, req, res, next);
};
