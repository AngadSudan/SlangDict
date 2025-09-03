const User = require("../models/User");
const {validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');

exports.register = async (req,res,next)=>{
    console.log("helo");
    try{
        const errors = validationResult(req);
        if(!errors.isEmpty()) return res.status(400).json({errors:errors.array()});
        
        const {username,email,password} = req.body;
        if(await User.findOne({email})) return res.status(400).json({msg: "Email already Exists"});

        const user = new User({username, email, password});
        await user.save();

        const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN});
        res.status(201).json({token, user:{id:user._id,username:user.username,email: user.email}})
    }
    catch(err){next(err);}
};

exports.login = async (req,res,next)=>{
    try{
        const {email,password} = req.body;
        const user = await User.findOne({email});
        console.log("User found:", user);
console.log("Entered password:", password);

        if(!user || !(await user.comparePassword(password))) return res.status(400).json({msg:"Invalid Credentials"});

        const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN});
        res.json({token, user:{id:user._id,username:user.username,email: user.email}})
    }
    catch(err){next(err);}
};

// retrieves the profile of the currunt user

exports.me = async (req,res,next)=>{
    try{
        const user = await User.findById(req.user.id).select('-password').populate('favorites')
        res.json(user);
    }
    catch(err){next(err);}
};