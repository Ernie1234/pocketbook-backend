import mongoose, { Document } from 'mongoose';

import { TransactionStatusType, TransactionType } from '../utils/types';

// Define the Transaction interface
export interface ITransaction extends Document {
  commodityName: string;
  type: string; // Assuming TransactionType is an enum
  quantity: number | null; // Allow null for optional quantity
  status?: string; // Optional status
  reference?: string; // Optional reference
  unit: string;
  price: number;
  userId: mongoose.Types.ObjectId;
}

// Define the Transaction schema
const TransactionSchema = new mongoose.Schema<ITransaction>(
  {
    commodityName: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: TransactionType,
      required: true,
    },
    quantity: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: TransactionStatusType,
    },
    reference: {
      type: String,
      default: null,
    },
    unit: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
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

// Create and export the Transaction model
export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);
