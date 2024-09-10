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
      enum: ['admin', 'user'],
      default: 'user',
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    verificationTokenExpiresAt: Date,
    verificationToken: String,
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  },
);

export default mongoose.model('User', UserSchema);
