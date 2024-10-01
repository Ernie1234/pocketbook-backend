/* eslint-disable no-param-reassign */
import mongoose from 'mongoose';

const PriceSchema = new mongoose.Schema(
  {
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
    commodityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Commodity',
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
PriceSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const Price = mongoose.model('Price', PriceSchema);
