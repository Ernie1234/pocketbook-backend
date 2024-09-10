import express from 'express';

import { signUpUser, signInUser, logOutUser, veryfyEmail } from '../controllers/user-controller';
import { validateUserSignUp, validateVerificationCode } from '../middlewares/user-validator';

const router = express.Router();

router.post('/sign-up', validateUserSignUp, signUpUser);
router.post('/sign-in', signInUser);
router.post('/logout', logOutUser);
router.post('/verify-email', validateVerificationCode, veryfyEmail);

export default router;
