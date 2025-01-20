import HTTP_STATUS from '../utils/http-status';
import TestFactory from './factory';
import {
  createdMsg,
  invalidCredentialsMsg,
  invalidTokenMsg,
  noUserMsg,
  userAlreadyExist,
  successMsg,
} from '../constants/messages';

const url = '/api/v1';

const errIfNoUser = 'should return error for non-existent user';
const nonExistMail = 'nonexistent@example.com';
const newPassword = 'NewPassword123!';

describe('User Authentication', () => {
  const factory = new TestFactory();
  const testUser = {
    email: 'test@example.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
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
        password: 'wrongPassword',
      });

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.message).toBe(invalidCredentialsMsg);
    });

    it(errIfNoUser, async () => {
      const response = await factory.app.post(`${url}/users/sign-in`).send({
        email: nonExistMail,
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
        verificationCode: '123456',
      });

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body).toMatchObject({
        success: false,
        message: invalidTokenMsg,
      });
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

    it(errIfNoUser, async () => {
      const response = await factory.app.post(`${url}/users/resend-verification`).send({
        email: nonExistMail,
      });

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.message).toBe(invalidCredentialsMsg);
    });
  });

  describe('POST /sign-out', () => {
    it('should successfully log out user', async () => {
      const response = await factory.app.post(`${url}/users/sign-out`);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toEqual({
        success: true,
        message: 'Logout successful',
      });
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
      expect(response.body).toEqual({
        success: true,
        message: 'Password reset link sent to your email!',
      });
    });

    it(errIfNoUser, async () => {
      const response = await factory.app.post(`${url}/users/forgot-password`).send({
        email: nonExistMail,
      });

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.message).toBe(noUserMsg);
    });
  });

  describe('POST /reset-password/:token', () => {
    let resetToken: string;

    beforeEach(async () => {
      // Create a user and request password reset
      await factory.app.post(`${url}/users/sign-up`).send(testUser);
      await factory.app.post(`${url}/users/forgot-password`).send({
        email: testUser.email,
      });

      // Get the reset token from the database
      const UserModel = await import('../models/user');
      const User = UserModel.default;
      const user = await User.findOne({ email: testUser.email });
      resetToken = user?.resetPasswordToken as string;
    });

    it('should successfully reset password', async () => {
      const response = await factory.app.post(`${url}/users/reset-password/${resetToken}`).send({
        password: newPassword,
      });

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toEqual({
        success: true,
        message: `Password reset ${successMsg}`,
      });

      // Try signing in with new password
      const signInResponse = await factory.app.post(`${url}/users/sign-in`).send({
        email: testUser.email,
        password: newPassword,
      });

      expect(signInResponse.status).toBe(HTTP_STATUS.OK);
    });

    it('should return error for invalid reset token', async () => {
      const response = await factory.app.post(`${url}/users/reset-password/invalid-token`).send({
        password: newPassword,
      });

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.message).toBe(invalidTokenMsg);
    });

    it('should return error for expired reset token', async () => {
      // Update the user's reset token expiration to be in the past
      const UserModel = await import('../models/user');
      const User = UserModel.default;
      await User.findOneAndUpdate(
        { email: testUser.email },
        { resetPasswordExpires: new Date(Date.now() - 3_600_000) },
      );

      const response = await factory.app.post(`${url}/users/reset-password/${resetToken}`).send({
        password: 'NewPassword123!',
      });

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.message).toBe(invalidTokenMsg);
    });
  });
});
