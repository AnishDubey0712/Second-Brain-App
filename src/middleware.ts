import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "./index";

export const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No or invalid token provided" });
  }

  const token = authHeader.split(" ")[1]; // ✅ Extract the actual token

  try {
    const decoded = jwt.verify(token, JWT_PASSWORD) as { id: string };
    (req as any).userId = decoded.id; // ✅ Fix TypeScript error
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
