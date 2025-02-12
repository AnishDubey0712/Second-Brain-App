"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_PASSWORD = void 0;
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./db");
dotenv_1.default.config();
exports.JWT_PASSWORD = process.env.JWT_PASSWORD;
const MONGO_URL = process.env.MONGO_URL;
const middleware_1 = require("./middleware");
//db connection
main()
    .then(() => {
    console.log("Connected to DB");
})
    .catch((err) => {
    console.log(err);
});
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield mongoose_1.default.connect(MONGO_URL);
    });
}
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// User signup
app.post("/api/v1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        const user = new db_1.UserModel({ username, password });
        yield user.save();
        res.json({ message: "User created" });
    }
    catch (err) {
        res.json({ message: "User already exists" });
    }
}));
// User signin
app.post("/api/v1/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const existingUser = yield db_1.UserModel.findOne({ username, password });
    if (existingUser) {
        const token = jsonwebtoken_1.default.sign({ id: existingUser._id }, exports.JWT_PASSWORD);
        res.json({ token });
    }
    else {
        res.json({ message: "Invalid username or password" });
    }
}));
// Generate random hash of 10 characters
function random(length) {
    const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}
// **💡 Share brain (Create or Retrieve Existing Link)**
app.post("/api/v1/brain/share", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const share = req.body.share === true || req.body.share === "true"; // ✅ Converts "true"/"false" string to boolean
    const userId = req.userId; // ✅ Fix TypeScript error
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const existingLink = yield db_1.LinkModel.findOne({ userId });
    if (share) {
        if (existingLink) {
            res.json({ message: "Brain already shared", hash: existingLink.hash });
            return;
        }
        const hash = random(10);
        yield db_1.LinkModel.create({ hash, userId });
        res.json({ message: "Brain shared", hash });
    }
    else {
        if (!existingLink) {
            res.status(404).json({ message: "No shared brain found to remove" });
            return;
        }
        //Ensure the link is deleted successfully
        const deleted = yield db_1.LinkModel.deleteOne({ userId });
        if (deleted.deletedCount > 0) {
            res.json({ message: "Brain unshared successfully" });
        }
        else {
            res.status(500).json({ message: "Failed to unshare brain" });
        }
    }
}));
// 💡 Retrieve Content Using Shared Link
app.get("/api/v1/brain/:shareLink", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { shareLink } = req.params;
    const link = yield db_1.LinkModel.findOne({ hash: shareLink });
    if (!link) {
        res.status(404).json({ message: "Invalid share link" });
        return;
    }
    const content = yield db_1.ContentModel.find({ userId: link.userId }).populate("userId");
    const user = yield db_1.UserModel.findById(link.userId);
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    res.json({ username: user.username, content });
}));
// **💡 Get User Content**
app.get("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized access" });
        return;
    }
    const content = yield db_1.ContentModel.find({ userId }).populate("userId");
    if (content.length === 0) {
        res.status(404).json({ message: "No content added yet" });
        return;
    }
    res.status(200).json(content);
}));
//@ts-ignore
app.post("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, link } = req.body;
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const newContent = yield db_1.ContentModel.create({ title, link, userId, tags: [] });
        res.status(201).json({ message: "Content added", content: newContent });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to add content" });
    }
}));
// 💡 Delete Content
app.delete("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contentId = req.body.contentId;
    const userId = req.userId;
    const deleted = yield db_1.ContentModel.deleteMany({ _id: contentId, userId });
    if (deleted.deletedCount === 0) {
        res.status(404).json({ message: "Content not found" });
        return;
    }
    res.json({ message: "Content deleted" });
}));
// Start the server
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
