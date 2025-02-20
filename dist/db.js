"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkModel = exports.ContentModel = exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
// **User Schema**
const UserSchema = new mongoose_2.Schema({
    username: { type: String, unique: true },
    password: { type: String },
});
exports.UserModel = mongoose_1.default.model("User", UserSchema);
// Content Schema (Now Supports Categories & Hashtags)**
const ContentSchema = new mongoose_2.Schema({
    title: { type: String, required: true },
    link: { type: String, required: true },
    type: { type: String, enum: ["tweets", "videos", "links", "documents", "tags"], required: true }, // 🔥 New Field
    tags: [{ type: String }],
    userId: { type: mongoose_1.default.Types.ObjectId, ref: "User", required: true }
});
exports.ContentModel = mongoose_1.default.model("Content", ContentSchema);
// **Shared Link Schema**
const LinkSchema = new mongoose_2.Schema({
    hash: { type: String },
    userId: { type: mongoose_1.default.Types.ObjectId, ref: "User", unique: true, required: true },
});
exports.LinkModel = mongoose_1.default.model("Link", LinkSchema);
