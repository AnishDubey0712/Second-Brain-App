import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "./index";

export const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(authHeader, JWT_PASSWORD) as { id: string };
    (req as any).userId = decoded.id; // ✅ Fix TypeScript error
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
