import mongoose from 'mongoose';
const { MONGODB_URI } = process.env;
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in environment variables');
}
export const connectDB = async (): Promise<void> => {
  await mongoose.connect(MONGODB_URI);
};
