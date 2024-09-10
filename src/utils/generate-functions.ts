import jwt from 'jsonwebtoken';
import { Response } from 'express';

export const generateVerificationToken = (): string => {
  const randomNumber = Math.floor(Math.random() * 1_000_000);
  return randomNumber.toString().padStart(6, '0');
};

export const generateTokenAndSetCookies = (res: Response, userId: string) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // lax,none, strict
    maxAge: 7 * 24 * 60 * 60 * 1000,
    // path: '/',
  });

  return token;
};
