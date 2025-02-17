import mongoose from "mongoose";
import { Schema } from "mongoose";

// **User Schema**
const UserSchema = new Schema({
  username: { type: String, unique: true },
  password: { type: String },
});
export const UserModel = mongoose.model("User", UserSchema);

// **Content Schema (Now Supports Categories & Hashtags)**
const ContentSchema = new Schema({
  title: { type: String, required: true },
  link: { type: String, required: true },
  type: { type: String, enum: ["tweets", "videos", "links", "documents", "tags"], required: true }, // 🔥 New Field
  tags: [{ type: mongoose.Types.ObjectId, ref: "Tag", default: [] }],
  userId: { type: mongoose.Types.ObjectId, ref: "User", required: true }
});

export const ContentModel = mongoose.model("Content", ContentSchema);

// **Shared Link Schema**
const LinkSchema = new Schema({
  hash: { type: String },
  userId: { type: mongoose.Types.ObjectId, ref: "User", unique: true, required: true },
});
export const LinkModel = mongoose.model("Link", LinkSchema);
