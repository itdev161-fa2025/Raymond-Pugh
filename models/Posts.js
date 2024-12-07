import { body } from "express-validator";
import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
    user:{
        type:'ObjectId',
        ref:'User'
    },
    title:{
        type:String,
        required:true
    },
    body:{
        type:String,
        required:true
    },
    date:{
        type:String,
        required:true 
    }
})

const Post = mongoose.model('post',PostSchema);

export default Post;