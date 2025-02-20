import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken"; 
import dotenv from "dotenv";
import { UserModel, ContentModel, LinkModel } from "./db";
import cors from "cors";

dotenv.config();

export const JWT_PASSWORD = process.env.JWT_PASSWORD as string;
const MONGO_URL = process.env.MONGO_URL as string;

import { userMiddleware } from "./middleware";

// Database Connection
main()
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Improved CORS Setup
app.use(cors({ origin: "http://localhost:5173", credentials: true, methods: ["GET", "POST", "DELETE"] }));

// ✅ User Signup
app.post("/api/v1/signup", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = new UserModel({ username, password });
    await user.save();
    res.json({ message: "User created" });
  } catch (err) {
    res.json({ message: "User already exists" });
  }
});

// ✅ User Signin
app.post("/api/v1/signin", async (req, res) => {
  const { username, password } = req.body;
  const existingUser = await UserModel.findOne({ username, password });
  if (existingUser) {
    const token = jwt.sign({ id: existingUser._id }, JWT_PASSWORD);
    res.json({ token });
  } else {
    res.json({ message: "Invalid username or password" });
  }
});

// ✅ Generate Random Hash for Sharing Content
function random(length: number): string {
  const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join("");
}

// ✅ Share Brain
app.post("/api/v1/brain/share", userMiddleware, async (req, res) => {
  const share = req.body.share === true || req.body.share === "true";
  const userId = (req as any).userId;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const existingLink = await LinkModel.findOne({ userId });

  if (share) {
    if (existingLink) {
      res.json({ message: "Brain already shared", hash: existingLink.hash });
      return;
    }
    const hash = random(10);
    await LinkModel.create({ hash, userId });
    res.json({ message: "Brain shared", hash });
  } else {
    if (!existingLink) {
      res.status(404).json({ message: "No shared brain found to remove" });
      return;
    }

    const deleted = await LinkModel.deleteOne({ userId });
    deleted.deletedCount > 0
      ? res.json({ message: "Brain unshared successfully" })
      : res.status(500).json({ message: "Failed to unshare brain" });
  }
});

// ✅ Retrieve Content Using Shared Link
app.get("/api/v1/brain/:shareLink", async (req, res) => {
  const { shareLink } = req.params;
  const link = await LinkModel.findOne({ hash: shareLink });

  if (!link) {
    res.status(404).json({ message: "Invalid share link" });
    return;
  }

  const content = await ContentModel.find({ userId: link.userId }).populate("userId");
  const user = await UserModel.findById(link.userId);

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json({ username: user.username, content });
});

// ✅ Get User Content
app.get("/api/v1/content", userMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized access" });
      return;
    }

    const { type } = req.query;
    const allowedTypes = ["tweets", "videos", "links", "documents", "tags"];

    if (type && !allowedTypes.includes(type as string)) {
      res.status(400).json({ message: "Invalid content type" });
      return;
    }

    const query: any = { userId };
    if (type) query.type = type;

    const content = await ContentModel.find(query).populate("userId");
    res.status(200).json(content.length ? content : []);
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Add Content (With Tags)
app.post("/api/v1/content", userMiddleware, async (req, res): Promise<void> => {
  const { title, link, type, tags } = req.body;
  const userId = (req as any).userId;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const allowedTypes = ["tweets", "videos", "links", "documents"];
  if (!allowedTypes.includes(type)) {
    res.status(400).json({ message: "Invalid content type" });
    return;
  }

  try {
    const newContent = await ContentModel.create({ title, link, type, tags, userId });
    res.status(201).json({ message: "Content added", content: newContent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add content" });
  }
});


// ✅ Delete Content (Efficient & Secure)
app.delete("/api/v1/content", userMiddleware, async (req, res) => {
  const { contentId } = req.body;
  const userId = (req as any).userId;

  const deleted = await ContentModel.findOneAndDelete({ _id: contentId, userId });

  if (!deleted) {
    res.status(404).json({ message: "Content not found" });
    return;
  }

  res.json({ message: "Content deleted successfully" });
});

// ✅ Start the Server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
