import { Request, Response } from 'express';

import {
  serverErrorMsg,
  noUserMsg,
  fetchedSuccessMsg,
  noCommodityMsg,
  InsufficientCommodityMsg,
} from '../constants/messages';
import HTTP_STATUS from '../utils/http-status';
import logger from '../logs/logger';
import User from '../models/user';
import { Portfolio } from '../models/portfolio';
import { Transaction } from '../models/transaction';
import { Notification } from '../models/notification';
import { TransactionStatusType, TransactionType } from '../utils/types';
import Commodity from '../models/commodity';

//  CREATE A transaction
export const createTransaction = async (req: Request, res: Response) => {
  const { price, commodityName, unit, quantity } = req.body;
  try {
    const user = await User.findById(req.userId).select('-password');

    // Handle case where user does not exist
    if (!user) {
      logger.error(noUserMsg);
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: noUserMsg });
    }

    const userId = user.id;

    // Update the market commodity profile
    const commodity = await Commodity.findOne({ commodityName });

    if (!commodity) {
      logger.error(noCommodityMsg);
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: noCommodityMsg });
    }

    if (commodity.quantity === undefined || commodity.quantity < quantity || commodity.quantity <= 0) {
      logger.error(InsufficientCommodityMsg);
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: InsufficientCommodityMsg });
    }

    // Create a new transaction
    const newTransaction = new Transaction({
      unit,
      price,
      userId,
      quantity,
      commodityName,
      type: TransactionType.BOUGHT,
      status: TransactionStatusType.SUCCESS,
    });

    const trans = await newTransaction.save();

    // Find existing portfolio entry
    const portfolio = await Portfolio.findOne({ userId, commodityName });

    if (!portfolio) {
      // Create a new portfolio entry
      const newPortfolio = new Portfolio({
        userId,
        commodityName,
        totalQuantity: quantity,
        balance: price,
      });
      await newPortfolio.save();
    } else {
      portfolio.totalQuantity += quantity;
      portfolio.balance += trans.price;
      await portfolio.save();
    }

    // Subtract the quantity from the commodity's quantity
    if (commodity.quantity !== undefined && commodity.quantity >= quantity) {
      commodity.quantity -= quantity;
      await commodity.save(); // Save the updated commodity
    } else {
      logger.error(InsufficientCommodityMsg);
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: InsufficientCommodityMsg });
    }

    // Create a notification for the user
    const title = 'Bought Commodity';
    const body = `You have added ${commodityName} commodity to your portfolio`;

    await Notification.create({ userId, title, body }); // Ensure this is the correct way to create a notification

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: fetchedSuccessMsg,
      data: {
        transaction: trans,
        portfolio,
      },
    });
  } catch (error) {
    logger.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({ message: serverErrorMsg });
  }
};
