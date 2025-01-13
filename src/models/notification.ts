/* eslint-disable no-param-reassign */
import mongoose from 'mongoose';

export interface INotification extends mongoose.Document {
  title: string;
  body: string;
  createdAt: Date;
  userId: mongoose.Types.ObjectId;
}

const NotificationSchema = new mongoose.Schema<INotification>(
  {
    title: {
      type: String,
    },
    body: {
      type: String,
      required: true,
    },
    createdAt: {
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
    timestamps: true,
  },
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
