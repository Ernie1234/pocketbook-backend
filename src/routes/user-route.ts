import express from 'express';

import { signUpUser, signInUser, logOutUser } from '../controllers/user-controller';
import { validateUserSignUp } from '../middlewares/user-validator';

const router = express.Router();

router.post('/sign-up', validateUserSignUp, signUpUser);
router.post('/sign-in', signInUser);
router.post('/logout', logOutUser);

export default router;
