import Joi from 'joi';

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
  color: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .required()
    .trim()
    .messages({
      'string.base': 'Color must be a string',
      'string.pattern.base': 'Color must be a valid hex color (e.g. #FF5733)',
      'any.required': 'Color is required',
    }),
  price: Joi.number().greater(0).required().messages({
    'number.base': 'Price must be a number',
    'number.greater': 'Price must be greater than 0',
    'any.required': 'Price is required',
  }),
  quantity: Joi.number().min(0).required().messages({
    'number.base': 'Quantity must be a number',
    'number.min': 'Quantity must be greater than or equal to 0',
    'any.required': 'Quantity is required',
  }),
  unit: Joi.string().min(1).max(20).required().messages({
    'string.base': 'Unit must be a string',
    'string.empty': 'Unit cannot be empty',
    'string.min': 'Unit must be at least 1 character long',
    'string.max': 'Unit must be less than or equal to 20 characters long',
    'any.required': 'Unit is required',
  }),
});

// Define the slug validation schema
export const slugValidationSchema = Joi.object({
  slug: Joi.string()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) // Slug pattern: lowercase letters, numbers, and dashes
    .min(1)
    .max(100) // Adjust max length as needed
    .required()
    .messages({
      'string.base': 'Slug must be a string',
      'string.empty': 'Slug cannot be empty',
      'string.pattern.base': 'Slug must consist of lowercase letters, numbers, and dashes only',
      'string.min': 'Slug must be at least 1 character long',
      'string.max': 'Slug must be less than or equal to 100 characters long',
      'any.required': 'Slug is required',
    }),
});
// Define the commodity name validation schema
export const commodityNameValidationSchema = Joi.object({
  commodityName: Joi.string()
    .min(1) // At least 1 character long
    .max(50) // Adjust max length as needed
    .required() // Required field
    .messages({
      'string.base': 'Commodity name must be a string',
      'string.empty': 'Commodity name cannot be empty',
      'string.min': 'Commodity name must be at least 1 character long',
      'string.max': 'Commodity name must be less than or equal to 100 characters long',
      'any.required': 'Commodity name is required',
    }),
});
// Define the update commodity validation schema
export const updateCommodityValidationSchema = Joi.object({
  commodityName: Joi.string().min(1).max(50).required().messages({
    'string.base': 'Commodity name must be a string',
    'string.empty': 'Commodity name cannot be empty',
    'string.min': 'Commodity name must be at least 1 character long',
    'string.max': 'Commodity name must be less than or equal to 50 characters long',
    'any.required': 'Commodity name is required',
  }),
  price: Joi.number().greater(0).optional().messages({
    'number.base': 'Price must be a number',
    'number.greater': 'Price must be greater than 0',
  }),
  quantity: Joi.number().min(0).optional().messages({
    'number.base': 'Quantity must be a number',
    'number.min': 'Quantity must be greater than or equal to 0',
  }),
}).custom((value, helpers) => {
  // Ensure either price or quantity is present, but not both empty
  const { price, quantity } = value;
  if (price == null && quantity == null) {
    return helpers.error('any.required', {
      message: 'At least one of price or quantity is required.',
    });
  }
  return value; // Return the validated value
});
