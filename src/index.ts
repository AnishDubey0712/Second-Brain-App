import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken"; 
import dotenv from "dotenv";
import { UserModel, ContentModel, LinkModel } from "./db";
dotenv.config();

export const JWT_PASSWORD = process.env.JWT_PASSWORD as string;
const MONGO_URL = process.env.MONGO_URL as string;//db url

import { userMiddleware } from "./middleware";

//db connection
main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// User signup
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

// User signin
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

// Generate random hash of 10 characters
function random(length: number): string {
  const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// 💡 Share brain (Create or Retrieve Existing Link)
app.post("/api/v1/brain/share", userMiddleware, async (req, res) => {
  const share = req.body.share === true || req.body.share === "true";   //Converts "true"/"false" string to boolean
const userId = (req as any).userId;   //Fix TypeScript error

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

  //Ensure the link is deleted successfully
  const deleted = await LinkModel.deleteOne({ userId });

  if (deleted.deletedCount > 0) {
    res.json({ message: "Brain unshared successfully" });
  } else {
    res.status(500).json({ message: "Failed to unshare brain" });
  }
}


});

// 💡 Retrieve Content Using Shared Link
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

// 💡 Get User Content
app.get("/api/v1/content", userMiddleware, async (req, res) => {
  const userId = (req as any).userId;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized access" });
    return;
  }

  const content = await ContentModel.find({ userId }).populate("userId");

  if (content.length === 0) {
    res.status(404).json({ message: "No content added yet" });
    return;
  }

  res.status(200).json(content);
});
//@ts-ignore
app.post("/api/v1/content", userMiddleware, async (req, res) => {
  const { title, link, type } = req.body;
  const userId = (req as any).userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // ✅ Validate category type
  const allowedTypes = ["tweets", "videos", "links", "documents", "tags"];
  if (!allowedTypes.includes(type)) {
    return res.status(400).json({ message: "Invalid content type" });
  }

  try {
    const newContent = await ContentModel.create({ title, link, userId, type, tags: [] });
    res.status(201).json({ message: "Content added", content: newContent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add content" });
  }
});


// 💡 Delete Content
app.delete("/api/v1/content", userMiddleware, async (req, res) => {
  const contentId = req.body.contentId;
  const userId = (req as any).userId;

  const deleted = await ContentModel.deleteMany({ _id: contentId, userId });

  if (deleted.deletedCount === 0) {
    res.status(404).json({ message: "Content not found" });
    return;
  }

  res.json({ message: "Content deleted" });
});

// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
