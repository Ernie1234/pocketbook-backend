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
      // unique: true,
      required: true,
    },
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
