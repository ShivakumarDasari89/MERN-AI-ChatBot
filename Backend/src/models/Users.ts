import mongoose from "mongoose";
import { randomUUID } from "crypto";

const chartSchema=new mongoose.Schema({
    id:{
        type:String,
        default:randomUUID(),
    },
    role:{
        type:String,
        required:true

    },
    content:{
        type:String,
        required:true
    }
})

const userSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
    chats:[chartSchema]
});

export default mongoose.model('Users',userSchema)