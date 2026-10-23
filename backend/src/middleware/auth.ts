import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET: string = process.env.JWT_SECRET ?? "";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set");
}

interface AuthTokenPayload extends JwtPayload {
  userId: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
      };
    }
  }
}

// returns the user id from a login token, or null if it's missing or invalid
export function getUserIdFromToken(token: string | undefined): number | null {
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (
      typeof decoded !== "object" ||
      decoded === null ||
      !("userId" in decoded)
    ) {
      return null;
    }

    return (decoded as AuthTokenPayload).userId;
  } catch {
    return null;
  }
}

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: "Access denied" });
  }

  const userId = getUserIdFromToken(token);

  if (userId === null) {
    return res.status(401).json({ error: "Invalid token" });
  }

  req.user = {
    id: userId,
  };

  next();
}
