/* eslint-disable no-param-reassign */
import mongoose from 'mongoose';

const SellSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    commodityName: {
      type: String,
      required: true,
    },
    bank: {
      type: String,
      required: true,
    },
    accountNumber: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
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
SellSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const Sell = mongoose.model('Sell', SellSchema);
