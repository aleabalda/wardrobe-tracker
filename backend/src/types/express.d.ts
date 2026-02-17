import { User } from "./user"; // optional if you have a User type

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        // add more fields if needed later
        // email?: string;
      };
    }
  }
}

export {};
