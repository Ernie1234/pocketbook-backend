import Joi from 'joi';

// Define the Joi schema for creating a transaction
const createTransactionSchema = Joi.object({
  commodityName: Joi.string()
    .min(1) // At least 1 character long
    .max(100) // Adjust max length as needed
    .required() // Required field
    .messages({
      'string.base': 'Commodity name must be a string',
      'string.empty': 'Commodity name cannot be empty',
      'string.min': 'Commodity name must be at least 1 character long',
      'string.max': 'Commodity name must be less than or equal to 100 characters long',
      'any.required': 'Commodity name is required',
    }),

  quantity: Joi.number().required().messages({
    'number.base': 'Quantity must be a number',
    'any.required': 'Quantity is required',
  }),

  status: Joi.string()
    .valid('PENDING', 'COMPLETED', 'FAILED') // Adjust based on your TransactionStatusType enum
    .optional()
    .messages({
      'string.base': 'Status must be a string',
      'any.only': 'Status must be one of "PENDING", "COMPLETED", or "FAILED"',
    }),

  unit: Joi.string().required().messages({
    'string.base': 'Unit must be a string',
    'any.required': 'Unit is required',
  }),

  price: Joi.number().required().messages({
    'number.base': 'Price must be a number',
    'any.required': 'Price is required',
  }),
});

export default createTransactionSchema;
