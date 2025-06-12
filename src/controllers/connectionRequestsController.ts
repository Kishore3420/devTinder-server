import { Request, Response } from 'express';
import { ConflictError, NotFoundError } from '../utils/errors';
import { ConnectionRequestsModel } from '../models/connectionRequests';
import { UserModel } from '../models/user';
import { ConnectionRequestStatus } from '../types/connectionRequests';

export const makeConnectionRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  const fromUserId = req.user?._id;
  if (!fromUserId) {
    throw new NotFoundError('User not authenticated');
  }
  const toUserId = req.params.toUserId;
  if (!toUserId) {
    throw new NotFoundError('Target user ID is required');
  }
  const status = req.params.status;

  const newConnectionRequest = new ConnectionRequestsModel({
    fromUserId,
    toUserId,
    status,
  });

  const isUserToConnectExist = await UserModel.findById(toUserId);
  if (!isUserToConnectExist) {
    throw new NotFoundError('User to connect not Found');
  }

  //If there is an existing connectionRequest
  const existingConnectionRequest = await ConnectionRequestsModel.findOne({
    $or: [
      { fromUserId, toUserId },
      { fromUserId: toUserId, toUserId: fromUserId },
    ],
  });

  if (existingConnectionRequest) {
    throw new ConflictError('Connection Request already exists');
  }

  const savedConnectionRequest = await newConnectionRequest.save();

  res.status(201).json({
    message: 'Connection Request Sent Successfully',
    connectionRequest: savedConnectionRequest,
  });
};
export const reviewConnectionRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  const loggedInUserId = req.user?._id;
  if (!loggedInUserId) {
    throw new NotFoundError('User not authenticated');
  }
  const toUserId = req.params.toUserId;
  if (!toUserId) {
    throw new NotFoundError('Target user ID is required');
  }
  const status = req.params.status;

  const connectionRequest = await ConnectionRequestsModel.findOne({
    fromUserId: toUserId,
    toUserId: loggedInUserId,
    status: 'interested',
  });
  if (!connectionRequest) {
    throw new NotFoundError('Connection request not found');
  }

  connectionRequest.status = status as ConnectionRequestStatus;
  const updatedConnectionRequest = await connectionRequest.save();
  res.status(201).json({
    message: 'Connection Request updated Successfully',
    connectionRequest: updatedConnectionRequest,
  });
};
