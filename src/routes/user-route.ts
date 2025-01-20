import express from 'express';

import {
  signUpUser,
  signInUser,
  logOutUser,
  verifyEmail,
  forgetPassword,
  resetPassword,
  resendCode,
} from '../controllers/user-controller';
import {
  validateForgetPassword,
  validateResetPassword,
  validateUserResend,
  validateUserSignIn,
  validateUserSignUp,
  validateVerificationCode,
} from '../middlewares/user-validator';
import { authMiddleware, checkAuth } from '../middlewares/auth';

const router = express.Router();

router.get('/check-auth', authMiddleware, async (req, res, next) => {
  try {
    await checkAuth(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/sign-up', validateUserSignUp, async (req, res, next) => {
  try {
    await signUpUser(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/resend-verification', validateUserResend, async (req, res, next) => {
  try {
    await resendCode(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/sign-in', validateUserSignIn, async (req, res, next) => {
  try {
    await signInUser(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/sign-out', async (req, res, next) => {
  try {
    await logOutUser(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/verification', validateVerificationCode, async (req, res, next) => {
  try {
    await verifyEmail(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/forgot-password', validateForgetPassword, async (req, res, next) => {
  try {
    await forgetPassword(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/reset-password/:token', validateResetPassword, async (req, res, next) => {
  try {
    await resetPassword(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
