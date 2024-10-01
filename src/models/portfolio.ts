/* eslint-disable no-param-reassign */
import mongoose from 'mongoose';

const PortfolioSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    commodityName: {
      type: String,
      unique: true,
      required: true,
    },
    color: {
      type: String,
      default: null,
    },
    balance: {
      type: Number,
      default: 0,
    },
    totalQuantity: {
      type: Number,
      default: 0,
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
PortfolioSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const Portfolio = mongoose.model('Portfolio', PortfolioSchema);
