import HTTP_STATUS from '../utils/http-status';
import TestFactory from './factory';
import {
  createdMsg,
  invalidCredentialsMsg,
  invalidTokenMsg,
  noUserMsg,
  userAlreadyExist,
} from '../constants/messages';
import logger from '../logs/logger';

const url = '/api/v1';

describe('User Authentication', () => {
  const factory = new TestFactory();
  const testUser = {
    email: 'test@example.com',
    password: 'Test123!',
    confirmPassword: 'Test123!',
    firstName: 'Test',
    lastName: 'User',
  };

  beforeEach(async () => {
    await factory.init();
  });

  afterEach(async () => {
    await factory.close();
  });

  describe('POST /sign-up', () => {
    it('should successfully create a new user', async () => {
      const response = await factory.app.post(`${url}/users/sign-up`).send(testUser);

      expect(response.status).toBe(HTTP_STATUS.CREATED);
      expect(response.body).toMatchObject({
        success: true,
        message: createdMsg,
        user: {
          email: testUser.email,
          name: `${testUser.firstName} ${testUser.lastName}`,
          isVerified: false,
        },
      });
      expect(response.body.user.password).toBeUndefined();
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return error if user already exists', async () => {
      // First create a user
      await factory.app.post(`${url}/users/sign-up`).send(testUser);

      // Try to create the same user again
      const response = await factory.app.post(`${url}/users/sign-up`).send(testUser);

      expect(response.status).toBe(HTTP_STATUS.CONFLICT);
      expect(response.body.message).toBe(userAlreadyExist);
    });

    it('should validate required fields', async () => {
      const response = await factory.app.post(`${url}/users/sign-up`).send({});

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('password');
      expect(response.body).toHaveProperty('firstName');
      expect(response.body).toHaveProperty('lastName');
    });
  });

  describe('POST /sign-in', () => {
    beforeEach(async () => {
      // Create a user before each signin test
      await factory.app.post(`${url}/users/sign-up`).send(testUser);
    });

    it('should successfully sign in an existing user', async () => {
      const response = await factory.app.post(`${url}/users/sign-in`).send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toMatchObject({
        success: true,
        message: 'Sign-in successful',
        user: {
          email: testUser.email,
          name: `${testUser.firstName} ${testUser.lastName}`,
        },
      });
      expect(response.body.user.password).toBeUndefined();
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return error for invalid credentials', async () => {
      const response = await factory.app.post(`${url}/users/sign-in`).send({
        email: testUser.email,
        password: 'wrongpassword',
      });

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.message).toBe(invalidCredentialsMsg);
    });

    it('should return error for non-existent user', async () => {
      const response = await factory.app.post(`${url}/users/sign-in`).send({
        email: 'nonexistent@example.com',
        password: testUser.password,
      });

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.message).toBe(invalidCredentialsMsg);
    });
  });

  describe('POST /verification', () => {
    let verificationToken: string;

    beforeEach(async () => {
      // Create a user and extract verification token
      const signupResponse = await factory.app.post(`${url}/users/sign-up`).send(testUser);
      verificationToken = signupResponse.body.user.verificationToken;
    });

    it('should successfully verify email', async () => {
      const response = await factory.app.post(`${url}/users/verification`).send({
        verificationCode: verificationToken,
      });

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toMatchObject({
        success: true,
        message: 'Email verified successfully',
        user: {
          email: testUser.email,
          isVerified: true,
        },
      });
    });

    it('should return error for invalid verification code', async () => {
      const response = await factory.app.post(`${url}/users/verification`).send({
        verificationCode: 'invalid-token',
      });

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.message).toBe(invalidTokenMsg);
    });
  });

  describe('POST /resend-verification', () => {
    beforeEach(async () => {
      await factory.app.post(`${url}/users/sign-up`).send(testUser);
    });

    it('should successfully resend verification code', async () => {
      const response = await factory.app.post(`${url}/users/resend-verification`).send({
        email: testUser.email,
      });

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toMatchObject({
        success: true,
        message: 'Verification code sent successfully',
        user: {
          email: testUser.email,
        },
      });
    });

    it('should return error for non-existent user', async () => {
      const response = await factory.app.post(`${url}/users/resend-verification`).send({
        email: 'nonexistent@example.com',
      });

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.message).toBe(invalidCredentialsMsg);
    });
  });

  describe('POST /sign-out', () => {
    it('should successfully log out user', async () => {
      const response = await factory.app.post(`${url}/users/sign-out`);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toMatchObject({
        success: true,
        message: 'Logout successful',
      });
      
      // Check that the cookie is cleared
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
      const tokenCookie = cookieArray.find((cookie: string) => cookie.startsWith('token='));
      expect(tokenCookie).toContain('Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    });
  });

  describe('POST /forgot-password', () => {
    beforeEach(async () => {
      await factory.app.post(`${url}/users/sign-up`).send(testUser);
    });

    it('should successfully send password reset email', async () => {
      const response = await factory.app.post(`${url}/users/forgot-password`).send({
        email: testUser.email,
      });

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toMatchObject({
        success: true,
        message: 'Password reset link sent to your email!',
      });
    });

    it('should return error for non-existent user', async () => {
      const response = await factory.app.post(`${url}/users/forgot-password`).send({
        email: 'nonexistent@example.com',
      });

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.message).toBe(noUserMsg);
    });
  });

  describe('POST /reset-password/:token', () => {
    let resetToken: string;

    beforeEach(async () => {
      // Create user and request password reset
      await factory.app.post(`${url}/users/sign-up`).send(testUser);
      await factory.app.post(`${url}/users/forgot-password`).send({
        email: testUser.email,
      });

      // Get the reset token from the user in the database
      const User = (await import('../models/user')).default;
      const user = await User.findOne({ email: testUser.email });
      if (!user) {
        throw new Error('User not found after signup');
      }
      if (!user.resetPasswordToken) {
        throw new Error('Reset password token not found');
      }
      resetToken = user.resetPasswordToken;
    });

    it('should successfully reset password', async () => {
      const response = await factory.app.post(`${url}/users/reset-password/${resetToken}`).send({
        password: 'NewPassword123!',
      });

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toMatchObject({
        success: true,
        message: 'Password reset Successful!',
      });

      // Try signing in with new password
      const signInResponse = await factory.app.post(`${url}/users/sign-in`).send({
        email: testUser.email,
        password: 'NewPassword123!',
      });
      expect(signInResponse.status).toBe(HTTP_STATUS.OK);
    });

    it('should return error for invalid reset token', async () => {
      const response = await factory.app.post(`${url}/users/reset-password/invalid-token`).send({
        password: 'NewPassword123!',
      });

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.message).toBe(invalidTokenMsg);
    });

    it('should return error for expired reset token', async () => {
      // Update token expiry to past date
      const User = (await import('../models/user')).default;
      await User.findOneAndUpdate(
        { email: testUser.email },
        { resetPasswordExpires: new Date(Date.now() - 3600000) }
      );

      const response = await factory.app.post(`${url}/users/reset-password/${resetToken}`).send({
        password: 'NewPassword123!',
      });

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.message).toBe(invalidTokenMsg);
    });
  });
});
