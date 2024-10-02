import { Request, Response } from 'express';

import { serverErrorMsg, noUserMsg, fetchedSuccessMsg } from '../constants/messages';
import HTTP_STATUS from '../utils/http-status';
import logger from '../logs/logger';
import User from '../models/user';
import { Portfolio } from '../models/portfolio';

//  CREATE A COMMODITY
export const getPortfolio = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      logger.error(noUserMsg);
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: noUserMsg });
    }

    // Fetch portfolio commodities for the given user
    const portfolio = await Portfolio.find({ userId: user.id }).populate('commodity');

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: fetchedSuccessMsg,
      portfolio,
    });
  } catch (error) {
    logger.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({ message: serverErrorMsg });
  }
};
