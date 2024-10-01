import Joi from 'joi';
import { emailRequiredMsg, invalidEmailMsg, pwdRequiredMsg } from '../constants/messages';

export const createCommoditySchema = Joi.object({
  commodityName: Joi.string().min(1).max(50).required().messages({
    'string.base': 'Commodity name must be a string',
    'string.empty': 'Commodity name cannot be empty',
    'string.min': 'Commodity name must be at least 1 character long',
    'string.max': 'Commodity name must be less than or equal to 50 characters long',
    'any.required': 'Commodity name is required',
  }),
  description: Joi.string().max(500).messages({
    'string.base': 'Description must be a string',
    'string.max': 'Description must be less than 500 characters long',
  }),
  color: Joi.string().min(7).required().trim().messages({
    'string.min': 'Password must be at least 8 characters long',
    'any.required': pwdRequiredMsg,
  }),
  price: Joi.number().greater(0).required().messages({
    'number.base': 'Price must be a number',
    'number.greater': 'Price must be greater than 0',
    'any.required': 'Price is required',
  }),
  maximumQuantity: Joi.number().integer().greater(Joi.ref('minimumQuantity')).required().messages({
    'number.base': 'Maximum quantity must be a number',
    'number.integer': 'Maximum quantity must be an integer',
    'number.greater': 'Maximum quantity must be greater than minimum quantity',
    'any.required': 'Maximum quantity is required',
  }),
  minimumQuantity: Joi.number().integer().min(0).required().messages({
    'number.base': 'Minimum quantity must be a number',
    'number.integer': 'Minimum quantity must be an integer',
    'number.min': 'Minimum quantity must be at least 0',
    'any.required': 'Minimum quantity is required',
  }),
});
