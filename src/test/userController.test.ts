// user-controller.test.ts
import request from 'supertest';
import express from 'express';
import { signUpUser } from '../controllers/user-controller';
import User from '../models/user';
import HTTP_STATUS from '../utils/http-status';
import logger from '../logs/logger';
import { sendVerificationEmail } from '../mails/emails';
import { generateTokenAndSetCookies } from '../utils/generate-functions';

// Mock dependencies
jest.mock('../models/user');
jest.mock('../logs/logger');
jest.mock('../mails/emails');
jest.mock('../utils/generate-functions', () => ({
  generateTokenAndSetCookies: jest.fn(),
}));

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'), // Set default mock implementation
}));

const app = express();
app.use(express.json());
app.post('/api/v1/sign-up', signUpUser);

describe('User Controller - signUpUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new user successfully', async () => {
    const newUser = {
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    };

    // Mock responses
    (User.findOne as jest.Mock).mockResolvedValue(null); // No existing user
    (User.prototype.save as jest.Mock).mockResolvedValue(newUser); // Mock save method
    (generateTokenAndSetCookies as jest.Mock).mockImplementation(() => {}); // Mock token generation
    (sendVerificationEmail as jest.Mock).mockResolvedValue(true); // Mock email sending

    const response = await request(app).post('/api/v1/sign-up').send(newUser);

    // Assertions
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

    (User.findOne as jest.Mock).mockResolvedValue(existingUser); // User already exists

    const response = await request(app).post('/api/v1/sign-up').send(existingUser);

    expect(response.status).toBe(HTTP_STATUS.CONFLICT);
    expect(response.body.message).toBe('User already exists'); // Adjust this message as needed
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('User already exists'));
  });

  it('should handle server errors', async () => {
    const newUser = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    };

    (User.findOne as jest.Mock).mockRejectedValue(new Error('Database error')); // Simulate a database error

    const response = await request(app).post('/api/v1/sign-up').send(newUser);

    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(response.body.message).toBe('Something went wrong!'); // Match the actual response
    expect(logger.error).toHaveBeenCalledWith(expect.any(Error));
  });
});
