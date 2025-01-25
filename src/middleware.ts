//Middlewares
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
export const userMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
}