import express from 'express';

import { signUpUser, signInUser, logOutUser, verifyEmail, forgetPassword } from '../controllers/user-controller';
import {
  validateForgetPassword,
  validateUserSignIn,
  validateUserSignUp,
  validateVerificationCode,
} from '../middlewares/user-validator';

const router = express.Router();

router.post('/sign-up', validateUserSignUp, signUpUser);
router.post('/sign-in', validateUserSignIn, signInUser);
router.post('/sign-out', logOutUser);
router.post('/verification', validateVerificationCode, verifyEmail);
router.post('/forgot-password', validateForgetPassword, forgetPassword);

export default router;
