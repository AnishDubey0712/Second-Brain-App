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
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Unauthorized: No or invalid token provided" });
        return;
    }
    const token = authHeader.split(" ")[1]; // ✅ Extract token after "Bearer "
    try {
        const decoded = jsonwebtoken_1.default.verify(token, index_1.JWT_PASSWORD);
        req.userId = decoded.id;
        next(); // ✅ Move to the next middleware
    }
    catch (error) {
        res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};
exports.userMiddleware = userMiddleware;
