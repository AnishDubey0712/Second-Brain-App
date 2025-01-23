//DataBase file
import {Model,Schema} from "mongoose";
const UserSchema = new Schema({
    username: {type: String, unique: true},
    password: {type: String},
})
const UserModel = new Model("User",UserSchema);