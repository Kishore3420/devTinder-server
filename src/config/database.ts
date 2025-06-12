import mongoose from 'mongoose';
import { config } from './app.config';

export const connectDB = async (): Promise<void> => {
  await mongoose.connect(config.mongodb.uri);
};
