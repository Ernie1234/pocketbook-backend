import express from 'express';

import { signUpUser, signInUser, logOutUser, verifyEmail } from '../controllers/user-controller';
import { validateUserSignIn, validateUserSignUp, validateVerificationCode } from '../middlewares/user-validator';

const router = express.Router();

router.post('/sign-up', validateUserSignUp, signUpUser);
router.post('/sign-in', validateUserSignIn, signInUser);
router.post('/sign-out', logOutUser);
router.post('/verification', validateVerificationCode, verifyEmail);

export default router;
