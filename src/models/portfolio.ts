/* eslint-disable no-param-reassign */
import mongoose, { Document } from 'mongoose';

// Define the Portfolio interface
export interface IPortfolio extends Document {
  commodityName: string;
  balance: number;
  totalQuantity: number;
  userId: mongoose.Types.ObjectId;
  commodityId: mongoose.Types.ObjectId; // Include the commodity reference
  updatedAt?: Date; // Add this line
  createdAt?: Date; // Add this line to match the schema
}

// Define the Portfolio schema
const PortfolioSchema = new mongoose.Schema<IPortfolio>(
  {
    commodityName: {
      type: String,
      unique: true, // Ensure commodity names are unique
      required: true,
    },
    commodityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Commodity', // Reference to the Commodity model
      required: true,
    },
    balance: {
      type: Number,
      default: 0, // Default balance is 0
    },
    totalQuantity: {
      type: Number,
      default: 0, // Default total quantity is 0
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: true,
    },
  },
  {
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

PortfolioSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Create and export the Portfolio model
export const Portfolio = mongoose.model<IPortfolio>('Portfolio', PortfolioSchema);
