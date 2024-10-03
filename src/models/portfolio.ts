import mongoose, { Document } from 'mongoose';

// Define the Portfolio interface
export interface IPortfolio extends Document {
  commodityName: string;
  balance: number;
  totalQuantity: number;
  userId: mongoose.Types.ObjectId;
}

// Define the Portfolio schema
const PortfolioSchema = new mongoose.Schema<IPortfolio>(
  {
    commodityName: {
      type: String,
      unique: true,
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    totalQuantity: {
      type: Number,
      default: 0,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true, // Automatically handles createdAt and updatedAt fields
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id; // Create a virtual id field
        delete ret._id; // Remove the original _id field
        delete ret.__v; // Remove the version key
        return ret;
      },
    },
  },
);

// Create and export the Portfolio model
export const Portfolio = mongoose.model<IPortfolio>('Portfolio', PortfolioSchema);
