const mongoose = require('mongoose');

const SlangSchema = new mongoose.Schema({
    word: {type:String,required: true, unique:true,index:true},
    meaning: {type:String,required: true},
    example: {type:String},
    catagory: {type:String,default:'general'},
    createdBy: {type:mongoose.Schema.Types.ObjectId,ref: 'User'},
    likes:{type: Number,default:0},
    likedBy: [{type:mongoose.Schema.Types.ObjectId,ref:'User'}]
},{timestamps:true});

module.exports = mongoose.model("Slang",SlangSchema);