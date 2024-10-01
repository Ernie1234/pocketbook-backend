import { Request, Response } from 'express';

import { serverErrorMsg, invalidCredentialsMsg } from '../constants/messages';
import HTTP_STATUS from '../utils/http-status';
import logger from '../logs/logger';
import User from '../models/user';
import { Price } from '../models/price';
import Commodity from '../models/commodity';
import { Notification } from '../models/notification';

//  CREATE A COMMODITY
export const createCommodity = async (req: Request, res: Response) => {
  const { name, description, unit, minQuantity, maxQuantity, color, price } = req.body;
  try {
    const user = await User.findById(req.userId).select('-password'); // No type error

    if (!user) {
      logger.error(invalidCredentialsMsg);
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'User not found' });
    }

    // Check if a commodity with the same name already exists
    const existingCommodity = await Commodity.findOne({ commodityName: name });
    if (existingCommodity) {
      logger.error('Commodity with this name already exists');
      return res.status(HTTP_STATUS.CONFLICT).json({ message: 'Commodity with this name already exists' });
    }

    // Create both the commodity and the price at the same time
    const newCommodity = await Commodity.create({
      commodityName: name,
      description,
      unit,
      minQuantity,
      maxQuantity,
      color,
      userId: user._id,
      prices: [], // Initialize with an empty array
    });

    const newPrice = await Price.create({
      price, // Ensure this is being passed correctly
      commodityId: newCommodity._id,
    });

    // Update the commodity to include the new price reference
    newCommodity.prices.push(newPrice._id);
    await newCommodity.save();

    // Notify all users about the new commodity
    const users = await User.find();

    const notifications = users.map((user) => ({
      userId: user._id,
      title: 'New Commodity',
      body: `A new commodity "${name}" has been added`,
      createdAt: new Date(),
    }));

    await Notification.insertMany(notifications);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Commodity added successfully!',
      newCommodity,
    });
  } catch (error) {
    logger.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({ message: serverErrorMsg });
  }
};

//  GET ALL COMMODITIES
export const getAllCommodities = async (req: Request, res: Response) => {
  try {
    const commodities = await Commodity.find({})
      .populate('prices') // Populate the prices reference
      .sort({ createdAt: -1 }); // Sort by createdAt in descending order

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Commodity fetched successfully!',
      commodities,
    });
  } catch (error) {
    logger.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({ message: serverErrorMsg });
  }
};

// Get commodity by slug
export const getCommodityBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params; // Extract slug from request parameters

  try {
    const commodity = await Commodity.findOne({ slug })
      .populate('user') // Populate user reference
      .populate('prices'); // Populate prices reference

    if (!commodity) {
      return res.status(HTTP_STATUS.NOT_FOUND).send({ message: 'Commodity not found' });
    }

    return res.status(HTTP_STATUS.OK).send(commodity);
  } catch (error) {
    logger.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({ message: serverErrorMsg });
  }
};

// Get commodity by name
export const getCommodityByName = async (req: Request, res: Response) => {
  const { commodityName } = req.body;
  try {
    const commodity = await Commodity.findOne({ commodityName }) // Adjusted to match schema field
      .select('prices'); // Only select prices
    return commodity;
  } catch (error) {
    logger.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({ message: serverErrorMsg });
  }
};

// Get commodity names and details
export const getCommodityName = async (req: Request, res: Response) => {
  try {
    const commodities = await Commodity.find({})
      .populate('prices') // Populate prices reference
      .select({
        commodityName: true, // Changed to match schema field
        unit: true,
        minQuantity: true,
        maxQuantity: true,
        prices: {
          price: true,
        },
      })
      .sort({ createdAt: -1 }); // Sort by createdAt in descending order
    return commodities;
  } catch (error) {
    logger.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({ message: serverErrorMsg });
  }
};
