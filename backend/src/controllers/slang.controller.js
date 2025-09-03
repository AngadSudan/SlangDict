const Slang = require('../models/Slang');
const User = require("../models/User");
const{validationResult} = require('express-validator');

exports.createSlang= async (req,res,next) =>{
    try{
        const errors = validationResult(req);
            if(!errors.isEmpty()) return res.status(400).json({"errors":errors.array()});
            const {word,meaning,example,catagory} = req.body;
            const exists = await Slang.findOne({word:new RegExp('^'+ word+'$','i')});
            if(exists) return res.status(400).json({msg:"Slang Exists"});

            const slang = await Slang.create({word,meaning,example,catagory,createdBy: req.user.id});
            res.status(201).json(slang);
        }
    catch(err){
        {next(err)};
    }
}
exports.getSlangs= async (req,res,next) =>{
    try{
        const{q,catagory,page=1,limit=20}= req.query;
        const filter = {};
        if(q) filter.$or = [{word:new RegExp(q,'i')},{meaning: new RegExp(q,'i')}];
        // ^^^ here we are searching for a slang by its name or meaning in case insensitive query ^^^
        if(catagory) filter.catagory = catagory;

        const slangs = await Slang.find(filter).sort({likes:-1,createdBy:-1}).skip((page - 1) * parseInt(limit))
.limit(parseInt(limit));
        res.json(slangs);

        }
    catch(err){
        {next(err)};
    }
}

exports.getSlang= async (req,res,next) =>{
    try{
        const slang = await Slang.findById(req.params.id).populate('createdBy','username');
        if(!slang) return res.status(404).json({msg:"Slang Not Found"});
        res.json(slang);
        }
    catch(err){
        {next(err)};
    }
}

exports.updateSlang= async (req,res,next) =>{
    try{
        const slang = await Slang.findById(req.params.id);
        if(!slang) return res.status(404).json({msg:"Slang Not Found"});
        if(!slang.createdBy.equals(req.user.id))return res.status(403).json({msg:"Not Allowed"});
        
        Object.assign(slang,req.body);
        await slang.save();
        res.json(slang);
        }
    catch(err){
        {next(err)};
    }
}

exports.deleteSlang= async (req,res,next) =>{
    try{
        const slang = await Slang.findById(req.params.id);
        if(!slang) return res.status(404).json({msg:"Slang Not Found"});
        if(!slang.createdBy.equals(req.user.id)) return res.status(403).json({msg:"Not Allowed"});

        await slang.deleteOne();
        res.json({msg:"Slang Deleted"});
        }
    catch(err){
        {next(err)};
    }
}

exports.likeSlang= async (req,res,next) =>{
    try{
        const slang = await Slang.findById(req.params.id);
        if(!slang) return res.status(404).json({msg:"Slang Not Found"});

        if (!slang.likedBy) slang.likedBy = [];


        if(slang.likedBy.includes(req.user.id)){
            slang.likedBy.pull(req.user.id);
        }
        else{
            slang.likedBy.push(req.user.id);
        }
        slang.likes = slang.likedBy.length;
        await slang.save();
        res.json({likes: slang.likes});
        }
    catch(err){
        {next(err)};
    }
}

exports.toggleFavorite= async (req,res,next) =>{
    try{
        const user = await User.findById(req.user.id);
        const id = req.params.id;
        const idx = user.favorites.findIndex(f=>String(f)===id);
        if(idx ===-1){
            user.favorites.push(id);
        }
        else{
            user.favorites.splice(idx,1);
        }
        await user.save();
        res.json({favorites: user.favorites});
        }
    catch(err){
        {next(err)};
    }
}