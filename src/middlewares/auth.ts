import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../logs/logger';
import User from '../models/user';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload;
    req.userId = decoded.id;
    return next();
  } catch (error) {
    logger.error('Invalid token', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Controller for checking if the user exists and is authorized
export const checkAuth = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    logger.error('Server error', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
