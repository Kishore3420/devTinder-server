import { Request, Response } from 'express';
import { ConflictError, NotFoundError, BadRequestError } from '../utils/errors';
import { ConnectionRequestsModel } from '../models/connectionRequests';
import { UserModel } from '../models/user';
import { ConnectionRequestStatus } from '../types/connectionRequests';
import mongoose from 'mongoose';

export const makeConnectionRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  const fromUserId = req.user?._id;
  if (!fromUserId) {
    throw new NotFoundError('User not authenticated');
  }

  const { toUserId, status } = req.params;
  if (!toUserId || !status) {
    throw new BadRequestError('Target user ID and status are required');
  }

  if (fromUserId.toString() === toUserId) {
    throw new BadRequestError('Cannot send connection request to yourself');
  }

  const fromUserObjectId = new mongoose.Types.ObjectId(fromUserId);
  const toUserObjectId = new mongoose.Types.ObjectId(toUserId);

  const [fromUser, toUser] = await Promise.all([
    UserModel.findById(fromUserObjectId),
    UserModel.findById(toUserObjectId),
  ]);

  if (!toUser) {
    throw new NotFoundError('User to connect not Found');
  }

  if (!fromUser) {
    throw new NotFoundError('Sender user not found');
  }

  const newConnectionRequest = new ConnectionRequestsModel({
    fromUserId: fromUserObjectId,
    toUserId: toUserObjectId,
    status,
  });

  const existingConnectionRequest = await ConnectionRequestsModel.findOne({
    $or: [
      { fromUserId: fromUserObjectId, toUserId: toUserObjectId },
      { fromUserId: toUserObjectId, toUserId: fromUserObjectId },
    ],
  });

  if (existingConnectionRequest) {
    throw new ConflictError('Connection Request already exists');
  }

  const savedConnectionRequest = await newConnectionRequest.save();

  let message = '';
  switch (status) {
    case 'ignore':
      message = `You have ignored ${toUser.firstName}'s profile`;
      break;
    case 'interested':
      message = `You have shown interest in ${toUser.firstName}'s profile`;
      break;
    case 'accepted':
      message = `You have accepted ${toUser.firstName}'s connection request`;
      break;
    case 'rejected':
      message = `You have rejected ${toUser.firstName}'s connection request`;
      break;
    default:
      message = 'Connection Request Sent Successfully';
  }

  res.status(201).json({
    message,
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

  const { toUserId, status } = req.params;
  if (!toUserId || !status) {
    throw new BadRequestError('Target user ID and status are required');
  }

  const loggedInUserObjectId = new mongoose.Types.ObjectId(loggedInUserId);
  const toUserObjectId = new mongoose.Types.ObjectId(toUserId);

  const [loggedInUser, fromUser] = await Promise.all([
    UserModel.findById(loggedInUserObjectId),
    UserModel.findById(toUserObjectId),
  ]);

  if (!loggedInUser || !fromUser) {
    throw new NotFoundError('User not found');
  }

  const connectionRequest = await ConnectionRequestsModel.findOne({
    fromUserId: toUserObjectId,
    toUserId: loggedInUserObjectId,
    status: 'interested',
  });

  if (!connectionRequest) {
    throw new NotFoundError('Connection request not found');
  }

  connectionRequest.status = status as ConnectionRequestStatus;
  const updatedConnectionRequest = await connectionRequest.save();

  let message = '';
  switch (status) {
    case 'ignore':
      message = `You have ignored ${fromUser.firstName}'s profile`;
      break;
    case 'interested':
      message = `You have shown interest in ${fromUser.firstName}'s profile`;
      break;
    case 'accepted':
      message = `You have accepted ${fromUser.firstName}'s connection request`;
      break;
    case 'rejected':
      message = `You have rejected ${fromUser.firstName}'s connection request`;
      break;
    default:
      message = 'Connection Request updated Successfully';
  }

  res.status(200).json({
    message,
    connectionRequest: updatedConnectionRequest,
  });
};
