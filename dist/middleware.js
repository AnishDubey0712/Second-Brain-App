"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("./index");
const userMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ message: "Unauthorized: No token provided" });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(authHeader, index_1.JWT_PASSWORD);
        req.userId = decoded.id; // ✅ Fix TypeScript error
        next(); // ✅ Ensure next() is called properly
    }
    catch (error) {
        res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};
exports.userMiddleware = userMiddleware;
