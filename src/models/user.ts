/* eslint-disable no-param-reassign */
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      // sparse: true,
    },
    name: {
      type: String,
      minlength: 2,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now(),
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ['ADMIN', 'USER'],
      default: 'USER',
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    verificationTokenExpiresAt: Date,
    verificationToken: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    commodities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Commodity',
      },
    ],
    notifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Notification',
      },
    ],
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
      },
    ],
    portfolios: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Portfolio',
      },
    ],
    sells: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sell',
      },
    ],
  },
  {
    // timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.__v;
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  },
);

export default mongoose.model('User', UserSchema);
