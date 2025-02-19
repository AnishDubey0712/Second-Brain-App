import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "./index";

export const userMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized: No or invalid token provided" });
    return;
  }

  const token = authHeader.split(" ")[1]; // ✅ Extract token after "Bearer "

  try {
    const decoded = jwt.verify(token, JWT_PASSWORD) as { id: string };
    (req as any).userId = decoded.id;
    next(); // ✅ Move to the next middleware
  } catch (error) {
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
