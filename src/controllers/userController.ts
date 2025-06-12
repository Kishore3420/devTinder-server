import { Request, Response } from 'express';
import { UserModel } from '../models/user';
import { NotFoundError } from '../utils/errors';
import { ConnectionRequestsModel } from '../models/connectionRequests';
const USER_SAFE_DATA = [
  'firstName',
  'lastName',
  'age',
  'gender',
  'photoUrl',
  'about',
  'skills',
];
export const getUserRequests = async (
  req: Request,
  res: Response
): Promise<void> => {
  const loggedInUserId = req.user?._id;
  if (!loggedInUserId) {
    throw new NotFoundError('User not found');
  }
  const receivedRequests = await ConnectionRequestsModel.find({
    toUserId: loggedInUserId,
    status: 'interested',
  }).populate('fromUserId', USER_SAFE_DATA);

  if (!receivedRequests) {
    throw new NotFoundError('No requests found');
  }
  res.status(200).json({
    message: 'Requests received retrieved successfully',
    receivedRequests,
  });
};

export const getUserConnections = async (
  req: Request,
  res: Response
): Promise<void> => {
  const loggedInUserId = req.user?._id;
  if (!loggedInUserId) {
    throw new NotFoundError('User not found');
  }
  const connectionRequests = await ConnectionRequestsModel.find({
    $or: [
      { toUserId: loggedInUserId, status: 'accepted' },
      { fromUserId: loggedInUserId, status: 'accepted' },
    ],
  })
    .populate('fromUserId', USER_SAFE_DATA)
    .populate('toUserId', USER_SAFE_DATA);
  if (!connectionRequests) {
    throw new NotFoundError('No requests found');
  }

  const connectionRequestsData = connectionRequests.map(row => {
    if (row.fromUserId?.toString() === loggedInUserId.toString()) {
      return row.toUserId;
    } else {
      return row.fromUserId;
    }
  });
  res.status(200).json({
    message: 'Requests received retrieved successfully',
    data: connectionRequestsData,
  });
};

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  const page = req.pagination?.page ?? 1;
  const limit = req.pagination?.limit ?? 10;
  const skip = (page - 1) * limit;

  const users = await UserModel.find()
    .select('-password')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await UserModel.countDocuments();
  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    users,
    pagination: {
      currentPage: page,
      totalPages,
      totalUsers: total,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
};
