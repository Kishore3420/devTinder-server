import { User } from './user';

declare module 'express' {
  interface Request {
    pagination?: {
      page: number;
      limit: number;
    };
    user?: User;
  }
}

export type { User };
