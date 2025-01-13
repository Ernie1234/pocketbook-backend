import jwt from 'jsonwebtoken';
import { Response } from 'express';

export const generateVerificationToken = (): string => {
  const randomNumber = Math.floor(Math.random() * 1_000_000);
  return randomNumber.toString().padStart(6, '0');
};

export const generateTokenAndSetCookies = (res: Response, userId: string) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

  const cookieOptions = {
    httpOnly: true,
    secure: false, // Disable for tests
    sameSite: 'lax' as const,
    signed: process.env.NODE_ENV !== 'test', // Don't sign cookies in test environment
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
    domain: undefined, // Allow any domain for testing
  };

  res.cookie('token', token, cookieOptions);
  // console.log('Cookie set with options:', cookieOptions);

  return token;
};
