//DataBase file
import mongoose from "mongoose";
import {Schema} from "mongoose";
const UserSchema = new Schema({
    username: {type: String, unique: true},
    password: {type: String},
})
export const UserModel =  mongoose.model("User",UserSchema);