import Joi, { Schema } from 'joi';
import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';

import {
  slugValidationSchema,
  createCommoditySchema,
  commodityNameValidationSchema,
  updateCommodityValidationSchema,
} from '../validators/commodity-validator';

const formatJoiError = (error: Joi.ValidationError) => {
  const formattedError: { [key: string]: string } = {};
  // eslint-disable-next-line unicorn/no-array-for-each
  error.details.forEach((detail: Joi.ValidationErrorItem) => {
    formattedError[detail.path.join('.')] = detail.message;
  });
  return formattedError;
};

const validateFn = <T extends ParamsDictionary>(
  schema: Schema<T>,
  data: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error, value } = schema.validate(data);
  if (error) {
    return res.status(400).send(formatJoiError(error));
  }
  // Assign the validated value back to the request body or params as needed
  if (req.body === data) {
    req.body = value as T;
  } else {
    req.params = value as T;
  }
  return next();
};

export const validateCreateCommodity = async (req: Request, res: Response, next: NextFunction) => {
  validateFn(createCommoditySchema, req.body, req, res, next);
};
export const validateCommoditySlug = async (req: Request, res: Response, next: NextFunction) => {
  validateFn(slugValidationSchema, req.params, req, res, next);
};
export const validateCommodityName = async (req: Request, res: Response, next: NextFunction) => {
  validateFn(commodityNameValidationSchema, req.params, req, res, next);
};
export const validateCommodityUpdate = async (req: Request, res: Response, next: NextFunction) => {
  validateFn(updateCommodityValidationSchema, req.body, req, res, next);
};
