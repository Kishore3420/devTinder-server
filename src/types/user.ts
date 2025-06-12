export type User = {
  _id?: string;
  firstName: string;
  lastName: string;
  emailId: string;
  password: string;
  age?: number;
  gender?: string;
  photoUrl?: string;
  about?: string;
  skills?: string[];
  getPublicProfile(): Partial<User>;
  getJWT(): Promise<string>;
  verifyPassword(password: string): boolean;
};
