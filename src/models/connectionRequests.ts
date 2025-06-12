import { ConnectionRequests } from '../types/connectionRequests';

import { Schema, model } from 'mongoose';
import { validateObjectId } from '../utils/validators';
import { ConflictError } from '../utils/errors';

const connectionRequestsSchema = new Schema<ConnectionRequests>(
  {
    toUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      validate: {
        validator: function (value: string): boolean {
          return validateObjectId(value);
        },
        message: 'Invalid toUserId format',
      },
    },
    fromUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      validate: {
        validator: function (value: string): boolean {
          return validateObjectId(value);
        },
        message: 'Invalid fromUserId format',
      },
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ['ignore', 'interested', 'accepted', 'rejected'],
        message: 'Status must be ignore or interested or accepted or rejected',
      },
      uppercase: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

connectionRequestsSchema.index({ fromUserId: 1, toUserId: 1 });

connectionRequestsSchema.pre('save', function (next) {
  if (this?.fromUserId?.toString() === this.toUserId?.toString()) {
    throw new ConflictError('Cannot send connection request to yourself!');
  }
  next();
});

export const ConnectionRequestsModel = model<ConnectionRequests>(
  'connectionRequests',
  connectionRequestsSchema
);
