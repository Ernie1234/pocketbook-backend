import request from 'supertest';
import express from 'express';
import { generateTokenAndSetCookies } from '../utils/generate-functions';
import { sendVerificationEmail } from '../mails/emails';
import User from '../models/user';
import HTTP_STATUS from '../utils/http-status';
import logger from '../logs/logger';
import { resendCode, signUpUser } from '../controllers/user-controller';

// Mock dependencies
jest.mock('../models/user'); // Ensure correct case in import
jest.mock('../logs/logger');
jest.mock('../mails/emails');

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies
app.post('/api/signup', signUpUser); // Route for sign up
app.post('/api/resend-verification', resendCode); // Route for resending verification

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

      // Mock User.findOne to return null, simulating no existing user
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.prototype.save as jest.Mock).mockResolvedValue(newUser);

      // Mock the utility functions
      (generateTokenAndSetCookies as jest.Mock).mockImplementation(() => {});
      (sendVerificationEmail as jest.Mock).mockResolvedValue(true);

      // Make the request to the signup endpoint
      const response = await request(app).post('/api/signup').send(newUser);

      // Assert the response
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

      // Mock User.findOne to return the existing user
      (User.findOne as jest.Mock).mockResolvedValue(existingUser);

      // Make the request to the signup endpoint
      const response = await request(app).post('/api/signup').send(existingUser);

      // Assert the response
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

      // Mock User.findOne to simulate a database error
      (User.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Make the request to the signup endpoint
      const response = await request(app).post('/api/signup').send(newUser);

      // Assert the response
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

      const response = await request(app).post('/api/resend-verification').send(userEmail);

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
