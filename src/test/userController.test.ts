import request from 'supertest';
import express from 'express';

import { generateTokenAndSetCookies } from '../utils/generate-functions';
import { sendVerificationEmail } from '../mails/emails';
import User from '../models/user';
import HTTP_STATUS from '../utils/http-status';
import logger from '../logs/logger';

// Mock dependencies
jest.mock('../models/User');
jest.mock('../logs/logger');
jest.mock('../mails/emails'); // Mock the email sending utility

const app = express();

describe('User Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear previous mocks
  });

  describe('signUpUser', () => {
    it('should create a new user successfully', async () => {
      const newUser = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      (User.findOne as jest.Mock).mockResolvedValue(null); // No existing user
      (User.prototype.save as jest.Mock).mockResolvedValue(newUser);
      (generateTokenAndSetCookies as jest.Mock).mockImplementation(() => {});
      (sendVerificationEmail as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .post('/api/signup') // Replace with your actual route
        .send(newUser);

      expect(response.status).toBe(HTTP_STATUS.CREATED);
      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe(newUser.email);
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('User created'));
    });

    it('should return conflict if user already exists', async () => {
      const existingUser = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      (User.findOne as jest.Mock).mockResolvedValue(existingUser); // User exists

      const response = await request(app).post('/api/signup').send(existingUser);

      expect(response.status).toBe(HTTP_STATUS.CONFLICT);
      expect(response.body.message).toBe('User already exists'); // Adjust according to your message
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('User already exists'));
    });

    it('should handle server errors', async () => {
      const newUser = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      (User.findOne as jest.Mock).mockRejectedValue(new Error('Database error')); // Simulate an error

      const response = await request(app).post('/api/signup').send(newUser);

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(response.body.message).toBe('Internal server error'); // Adjust according to your message
      expect(logger.error).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('resendCode', () => {
    it('should resend verification code successfully', async () => {
      const userEmail = { email: 'test@example.com' };
      const user = {
        id: '12345',
        email: userEmail.email,
      };

      (User.findOne as jest.Mock).mockResolvedValue(user); // User found
      (generateTokenAndSetCookies as jest.Mock).mockImplementation(() => {});
      (sendVerificationEmail as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .post('/api/resend-verification') // Replace with your actual route
        .send(userEmail);

      expect(response.status).toBe(HTTP_STATUS.CREATED);
      expect(response.body.success).toBe(true);
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining(`User created: ${user.id}`));
    });

    it('should return bad request if user does not exist', async () => {
      const userEmail = { email: 'test@example.com' };

      (User.findOne as jest.Mock).mockResolvedValue(null); // User not found

      const response = await request(app).post('/api/resend-verification').send(userEmail);

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.message).toBe('Invalid credentials'); // Adjust according to your message
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Invalid credentials'));
    });

    it('should handle server errors', async () => {
      const userEmail = { email: 'test@example.com' };

      (User.findOne as jest.Mock).mockRejectedValue(new Error('Database error')); // Simulate an error

      const response = await request(app).post('/api/resend-verification').send(userEmail);

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(response.body.message).toBe('Internal server error'); // Adjust according to your message
      expect(logger.error).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
