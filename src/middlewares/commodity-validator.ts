/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable arrow-body-style */
import Joi, { Schema } from 'joi';
import { Request, Response, NextFunction } from 'express';

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

const validateFn = <T extends Record<string, any>>(schema: Schema<T>, data: any, req: Request, res: Response, next: NextFunction) => {
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
  return validateFn(createCommoditySchema, req.body, req, res, next);
};
export const validateCommoditySlug = async (req: Request, res: Response, next: NextFunction) => {
  return validateFn(slugValidationSchema, req.params, req, res, next);
};
export const validateCommodityName = async (req: Request, res: Response, next: NextFunction) => {
  return validateFn(commodityNameValidationSchema, req.params, req, res, next);
};
export const validateCommodityUpdate = async (req: Request, res: Response, next: NextFunction) => {
  return validateFn(updateCommodityValidationSchema, req.body, req, res, next);
};
