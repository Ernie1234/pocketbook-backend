import { Request, Response } from 'express';

import {
  serverErrorMsg,
  commodityExistMsg,
  noUserMsg,
  noCommodityMsg,
  successCommodityMsg,
  unauthorizedMsg,
  updateSuccessMsg,
} from '../constants/messages';
import HTTP_STATUS from '../utils/http-status';
import logger from '../logs/logger';
import User from '../models/user';
import { Price } from '../models/price';
import Commodity from '../models/commodity';
import { Notification } from '../models/notification';

//  CREATE A COMMODITY
export const createCommodity = async (req: Request, res: Response) => {
  const { commodityName, description, unit, quantity, color, price } = req.body;
  try {
    const user = await User.findById(req.userId).select('-password'); // No type error

    if (!user) {
      logger.error(noUserMsg);
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: noUserMsg });
    }

    // Check if a commodity with the same name already exists
    const existingCommodity = await Commodity.findOne({ commodityName });
    if (existingCommodity) {
      logger.error(commodityExistMsg);
      return res.status(HTTP_STATUS.CONFLICT).json({ message: commodityExistMsg });
    }

    // Create both the commodity and the price at the same time
    const newCommodity = await Commodity.create({
      commodityName,
      description,
      unit,
      quantity,
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
      body: `A new commodity "${commodityName}" has been added`,
      createdAt: new Date(),
    }));

    await Notification.insertMany(notifications);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Commodity added successfully!',
      data: newCommodity,
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
      message: successCommodityMsg,
      data: commodities,
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
    const commodity = await Commodity.findOne({ slug }).populate('prices'); // Populate prices reference

    if (!commodity) {
      logger.error(noCommodityMsg);
      return res.status(HTTP_STATUS.NOT_FOUND).send({ message: noCommodityMsg });
    }

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: successCommodityMsg,
      data: commodity,
    });
  } catch (error) {
    logger.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({ message: serverErrorMsg });
  }
};

// Get commodity by name
export const getCommodityByName = async (req: Request, res: Response) => {
  const { commodityName } = req.params;
  try {
    const commodity = await Commodity.findOne({ commodityName }).populate('price');

    if (!commodity) {
      logger.error(noCommodityMsg);
      return res.status(HTTP_STATUS.NOT_FOUND).send({ message: noCommodityMsg });
    }
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: successCommodityMsg,
      data: commodity,
    });
  } catch (error) {
    logger.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({ message: serverErrorMsg });
  }
};

// UPDATE COMMODITY DETAILS
export const updateCommodity = async (req: Request, res: Response) => {
  const { commodityName, price, quantity } = req.body; // Extract from request body

  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      logger.error(noUserMsg);
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: noUserMsg });
    }

    const commodity = await Commodity.findOne({ commodityName }).populate('prices');

    if (!commodity) {
      logger.error(noCommodityMsg);
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: noCommodityMsg });
    }

    // Check user role for authorization
    if (user.role !== 'ADMIN') {
      logger.error('Unauthorized user');
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: unauthorizedMsg });
    }

    // Update quantity if provided
    if (quantity !== undefined && commodity.quantity === 0) {
      commodity.quantity = quantity;
    } else if (quantity !== undefined && commodity.quantity) {
      commodity.quantity += quantity;
    }

    // Create a new price document if price is provided
    let addedPrice;
    if (price !== undefined) {
      const newPrice = new Price({ price, commodityId: commodity._id });
      addedPrice = await newPrice.save(); // Save the new price document

      // Push the new price's ObjectId into the commodity's prices array
      commodity.prices.push(addedPrice._id);
    }

    await commodity.save(); // Save the updated commodity

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: updateSuccessMsg,
      data: {
        ...commodity.toObject(), // Convert to plain object
        prices: commodity.prices, // Include updated prices
      },
    });
  } catch (error) {
    logger.error(error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({ message: serverErrorMsg });
  }
};
