const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Defining User Models
const UserSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true, trim: true},
    email: {type: String, required: true, unique: true, lowercase: true},
    password: {type: String, required: true},
    favorites: [{type: mongoose.Schema.Types.ObjectId, ref:"Slang"}],    
}, {timestamps:true});

// Hashing Passwords
UserSchema.pre('save', async function(next){
    if(!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
    console.log("Hashed pass: "+ this.password);
    next();
});

UserSchema.methods.comparePassword = function(candidate){
    return bcrypt.compare(candidate, this.password);
};
module.exports = mongoose.model('User',UserSchema);