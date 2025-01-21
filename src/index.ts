//main index file
import express from "express";
import mongoose from "mongoose";
import { Jwt } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URL = process.env.MONGO_URL as string;

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
app.post("/api/v1/signup", (req, res) => {});
app.post("/api/v1/signin", (req, res) => {});
app.post("/api/v1/content", (req, res) => {});
app.get("/api/v1/content", (req, res) => {});
app.delete("/api/v1/content", (req, res) => {});
app.post("/api/v1/brain/share", (req, res) => {});
app.get("/api/v1/brain/:shareLink", (req, res) => {});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});