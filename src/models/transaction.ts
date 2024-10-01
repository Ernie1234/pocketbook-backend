/* eslint-disable no-param-reassign */
import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema(
  {
    commodityName: {
      type: String,
      required: true,
    },
    type: {
      type: String, // Consider using an enum for transaction types
      required: true,
    },
    quantity: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      default: null,
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
      ref: 'User',
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

// Update updatedAt field before saving
TransactionSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const Transaction = mongoose.model('Transaction', TransactionSchema);
