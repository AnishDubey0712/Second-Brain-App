// main index file
import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken"; // Use lowercase `jwt` as per convention
import dotenv from "dotenv";
import { UserModel, ContentModel } from "./db";
dotenv.config();

export const JWT_PASSWORD = "1234";
const MONGO_URL = process.env.MONGO_URL as string;

import { userMiddleware } from "./middleware";

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
app.post("/api/v1/signup", async (req, res): Promise<void> => {
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
app.post("/api/v1/signin", async (req, res): Promise<void> => {
  const { username, password } = req.body;
  const existingUser = await UserModel.findOne({ username, password });
  if (existingUser) {
    const token = jwt.sign({ id: existingUser._id }, JWT_PASSWORD);
    res.json({ token });
  } else {
    res.json({ message: "Invalid username or password" });
  }
});

// Create content
app.post("/api/v1/content", userMiddleware, async (req, res): Promise<void> => {
  const { link, type } = req.body;
  try {
    await ContentModel.create({
      link,
      type,
      // @ts-ignore
      userId: req.userId, // No ts-ignore needed if you extend `Request` type
      tags:[],
    });
    res.json({ message: "Content created" });
  } catch (error) {
    res.status(500).json({ error: "Failed to create content" });
    console.error(error);
  }
});

// Additional endpoints
app.get("/api/v1/content",userMiddleware,async (req, res) => {
  try {
    // Ensure userId is extracted from middleware
    // @ts-ignore
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized access" });
      return;
    }

    // Fetch content for the logged-in user
    const userContent = await ContentModel.find({ userId });

    res.status(200).json(userContent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch content" });
  }
});

app.delete("/api/v1/content", (req, res): void => {
  res.json({ message: "Delete content endpoint" });
});

app.post("/api/v1/brain/share", (req, res): void => {
  res.json({ message: "Share brain endpoint" });
});

app.get("/api/v1/brain/:shareLink", (req, res): void => {
  res.json({ message: `Access brain with shareLink: ${req.params.shareLink}` });
});

// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
