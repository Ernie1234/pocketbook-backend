import express from 'express';

import {
  signUpUser,
  signInUser,
  logOutUser,
  verifyEmail,
  forgetPassword,
  resetPassword,
} from '../controllers/user-controller';
import {
  validateForgetPassword,
  validateResetPassword,
  validateUserSignIn,
  validateUserSignUp,
  validateVerificationCode,
} from '../middlewares/user-validator';
import { authMiddleware, checkAuth } from '../middlewares/auth';

const router = express.Router();

router.get('/check-auth', authMiddleware, checkAuth);
router.post('/sign-up', validateUserSignUp, signUpUser);
router.post('/sign-in', validateUserSignIn, signInUser);
router.post('/sign-out', logOutUser);
router.post('/verification', validateVerificationCode, verifyEmail);
router.post('/forgot-password', validateForgetPassword, forgetPassword);
router.post('/reset-password/:token', validateResetPassword, resetPassword);

export default router;
