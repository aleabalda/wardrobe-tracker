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

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: "Access denied" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (
      typeof decoded !== "object" ||
      decoded === null ||
      !("userId" in decoded)
    ) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const payload = decoded as AuthTokenPayload;

    req.user = {
      id: payload.userId,
    };

    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
