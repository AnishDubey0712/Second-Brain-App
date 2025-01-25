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
// main index file
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken")); // Use lowercase `jwt` as per convention
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./db");
dotenv_1.default.config();
exports.JWT_PASSWORD = "1234";
const MONGO_URL = process.env.MONGO_URL;
const middleware_1 = require("./middleware");
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
// Create content
app.post("/api/v1/content", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { link, type } = req.body;
    try {
        yield db_1.ContentModel.create({
            link,
            type,
            // @ts-ignore
            userId: req.userId, // No ts-ignore needed if you extend `Request` type
            tags: [],
        });
        res.json({ message: "Content created" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create content" });
        console.error(error);
    }
}));
// Additional endpoints
app.get("/api/v1/content", (req, res) => {
    res.json({ message: "Get content endpoint" });
});
app.delete("/api/v1/content", (req, res) => {
    res.json({ message: "Delete content endpoint" });
});
app.post("/api/v1/brain/share", (req, res) => {
    res.json({ message: "Share brain endpoint" });
});
app.get("/api/v1/brain/:shareLink", (req, res) => {
    res.json({ message: `Access brain with shareLink: ${req.params.shareLink}` });
});
// Start the server
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
