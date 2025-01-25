//main index file
import express from "express";
import mongoose from "mongoose";
import  Jwt  from "jsonwebtoken";
import dotenv from "dotenv";
import { UserModel,ContentModel} from "./db";
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


app.post("/api/v1/signup", async(req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  try {
   const user = new UserModel({
    username,
    password,
  });
  await user.save();
  res.json({ message: "User created"});}
  catch (err) {
    res.json({ message: "User already exists"});
  }
});
app.post("/api/v1/signin", async(req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const existingUser = await UserModel.findOne({ username, password });
  if (existingUser) {
    const token = Jwt.sign({id:existingUser._id }, JWT_PASSWORD);
    res.json({ token });
  } else {
    res.json({ message: "Invalid username or password" });
  }
    
});
app.post("/api/v1/content", userMiddleware,async(req, res) => {
  const link = req.body.link;
  const type = req.body.type;
  await ContentModel.create({
    link,
    type,
    // @ts-ignore
    userId: req.userId,
    tags:[],
  });
  return res.json({ message: "Content created" });
});
app.get("/api/v1/content", (req, res) => {});
app.delete("/api/v1/content", (req, res) => {});
app.post("/api/v1/brain/share", (req, res) => {});
app.get("/api/v1/brain/:shareLink", (req, res) => {});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});