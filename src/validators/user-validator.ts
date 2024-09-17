import Joi from 'joi';
import { emailRequiredMsg, pwdRequiredMsg } from '../constants/messages';

export const signUpUserSchema = Joi.object({
  name: Joi.string()
    .alphanum()
    .min(2)
    .max(30)
    .required() // Ensure there's a line break before this
    .messages({
      'string.base': 'Name must be a string',
      'string.empty': 'Name cannot be empty',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name must be at most 30 characters long',
      'any.required': 'Name is required',
    }),
  password: Joi.string()
    .min(8)
    .required() // Ensure there's a line break before this
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'any.required': pwdRequiredMsg,
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required() // Ensure there's a line break before this
    .messages({
      'any.only': 'Passwords must match',
      'any.required': 'Confirm Password is required',
    }),
  email: Joi.string()
    .email()
    .required() // Ensure there's a line break before this
    .messages({
      'string.email': 'Email must be a valid email address',
      'any.required': emailRequiredMsg,
    }),
});

export const emailVerificationSchema = Joi.object({
  verificationCode: Joi.string().length(6).required().messages({
    'string.length': 'Verification code must be exactly 6 characters long',
    'any.required': 'Verification code is required',
  }),
});

export const signInUserSchema = Joi.object({
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'any.required': pwdRequiredMsg,
  }),
  email: Joi.string()
    .email()
    .required() // Ensure there's a line break before this
    .messages({
      'string.email': 'Email must be a valid email address',
      'any.required': emailRequiredMsg,
    }),
});

export const forgetPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Invalid email format',
    'any.required': emailRequiredMsg,
  }),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'string.empty': 'Token is required',
    'any.required': 'Token is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': pwdRequiredMsg,
    'string.min': 'Password must be at least 6 characters long',
    'any.required': pwdRequiredMsg,
  }),
});
