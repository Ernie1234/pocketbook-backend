/* eslint-disable consistent-return */
/* eslint-disable max-len */
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
import Commodity from '../models/commodity';
import { Portfolio } from '../models/portfolio';
import { Transaction } from '../models/transaction';
import { Notification } from '../models/notification';
import { TransactionStatusType, TransactionType } from '../utils/types';

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

    // eslint-disable-next-line max-len
    if (commodity.quantity === undefined || commodity.quantity < quantity || commodity.quantity <= 0) {
      logger.error(InsufficientCommodityMsg);
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: InsufficientCommodityMsg });
    }

    // Create a new transaction
    const newTransaction = new Transaction({
      unit,
      price,
      commodityName,
      quantity,
      type: TransactionType.BOUGHT,
      status: TransactionStatusType.PENDING,
      user: userId,
    });

    // Save the transaction
    await newTransaction.save();

    // Update commodity quantity
    commodity.quantity -= quantity;
    await commodity.save();

    // Update user's portfolio
    let portfolio = await Portfolio.findOne({ userId, commodityId: commodity.id }, { unique: true });

    if (portfolio) {
      // Update the existing portfolio entry
      portfolio.totalQuantity += Number(quantity);
      portfolio.balance += price; // Use the correct variable for price
    } else {
      // Create a new portfolio entry if it doesn't exist
      const color = `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`;
      portfolio = new Portfolio({
        userId,
        commodityName,
        totalQuantity: Number(quantity),
        balance: price,
        color,
      });
    }

    // Save the updated or newly created portfolio
    await portfolio.save();

    // Create a notification
    const newNotification = new Notification({
      user: userId,
      message: `You have successfully bought ${quantity} ${unit} of ${commodityName}`,
      type: 'transaction',
    });

    await newNotification.save();

    // Respond with success
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Transaction created successfully',
      data: newTransaction,
    });
  } catch (error) {
    logger.error(error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: serverErrorMsg });
  }
};

//  GET ALL TRANSACTIONS
export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      logger.error(noUserMsg);
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: noUserMsg });
    }

    const transactions = await Transaction.find({ userId: req.userId }).sort({ createdAt: -1 });

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: fetchedSuccessMsg,
      data: transactions,
    });
  } catch (error) {
    logger.error(error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: serverErrorMsg });
  }
};
