import { User } from './user';
import { ConnectionRequests } from './connectionRequests';
declare module 'express' {
  interface Request {
    pagination?: {
      page: number;
      limit: number;
    };
    user?: User;
  }
}

export type { User, ConnectionRequests };
