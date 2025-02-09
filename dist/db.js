"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentModel = exports.LinkModel = exports.UserModel = void 0;
//DataBase file
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
const UserSchema = new mongoose_2.Schema({
    username: { type: String, unique: true },
    password: { type: String },
});
exports.UserModel = mongoose_1.default.model("User", UserSchema);
const ContentSchema = new mongoose_2.Schema({
    title: { type: String },
    link: { type: String },
    tags: [{ type: mongoose_1.default.Types.ObjectId, ref: "Tag", default: [] }],
    userId: { type: mongoose_1.default.Types.ObjectId, ref: "User", required: true }
});
const LinkSchema = new mongoose_2.Schema({
    hash: { type: String },
    // link: {type: String},
    // tags:[{type:mongoose.Types.ObjectId, ref:"Tag",default:[]}],
    userId: { type: mongoose_1.default.Types.ObjectId, ref: "User", unique: true, required: true },
});
exports.LinkModel = mongoose_1.default.model("Link", LinkSchema);
exports.ContentModel = mongoose_1.default.model("Content", ContentSchema);
