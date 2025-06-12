import { Schema } from 'mongoose';

export type ConnectionRequests = {
  _id?: Schema.Types.ObjectId;
  fromUserId?: Schema.Types.ObjectId;
  toUserId?: Schema.Types.ObjectId;
  status?: ConnectionRequestStatus;
};

export type ConnectionRequestStatus =
  | 'ignore'
  | 'interested'
  | 'accepted'
  | 'rejected';
