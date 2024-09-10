import express from 'express';

import { signUpUser, signInUser, logOutUser, verifyEmail } from '../controllers/user-controller';
import { validateUserSignUp, validateVerificationCode } from '../middlewares/user-validator';

const router = express.Router();

router.post('/sign-up', validateUserSignUp, signUpUser);
router.post('/sign-in', signInUser);
router.post('/logout', logOutUser);
router.post('/verification', validateVerificationCode, verifyEmail);

export default router;
