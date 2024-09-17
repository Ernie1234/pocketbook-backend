import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../logs/logger';
import User from '../models/user';
import HTTP_STATUS from '../utils/http-status';

// Extend the Express Request interface within this file
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    // eslint-disable-next-line no-shadow
    interface Request {
      userId?: string; // Adjust the type if userId is a number
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload;
    req.userId = decoded.userId;
    return next();
  } catch (error) {
    logger.error('Invalid token', error);
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'Invalid token' });
  }
};

export const checkAuth = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-password'); // No type error

    if (!user) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'User not found' });
    }

    return res.status(HTTP_STATUS.OK).json({ success: true, user });
  } catch (error) {
    logger.error('Server error', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
  }
};
