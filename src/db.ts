//DataBase file
import mongoose from "mongoose";
import {Schema} from "mongoose";
const UserSchema = new Schema({
    username: {type: String, unique: true},
    password: {type: String},
})
export const UserModel =  mongoose.model("User",UserSchema);

const ContentSchema = new Schema({
    title: {type: String},
    link: {type: String},
    tags:{type:mongoose.Types.ObjectId, ref:"Tag"},
    userId:{type:mongoose.Types.ObjectId, ref:"User", required:true}

});
export const ContentModel = mongoose.model("Content",ContentSchema);