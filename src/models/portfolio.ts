import mongoose, { Document } from 'mongoose';

// Define the Portfolio interface
export interface IPortfolio extends Document {
  commodityName: string;
  balance: number;
  totalQuantity: number;
  userId: mongoose.Types.ObjectId;
  commodityId: mongoose.Types.ObjectId; // Include the commodity reference
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
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
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
