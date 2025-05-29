import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  await mongoose.connect(
    'mongodb+srv://kishore:rajesh@learn-node.vrcjek3.mongodb.net/devTinder'
  );
};
