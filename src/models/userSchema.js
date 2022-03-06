const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const env = require('dotenv').config();

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim:true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim:true
    },
    password: {
        type: String,
        required: true,
        trim:true
    },
    tokens:[{
        token:{
            type: String,
            required: true
        }
    }]
});

//middleware for generating token
userSchema.methods.generateAuthToken = async function(){
    try{
        const token = jwt.sign({_id: this._id}, process.env.TOKEN_KEY);
        this.tokens = this.tokens.concat({ token: token});
        await this.save();
        return token;

    }catch(err){
        console.error(err);
    }
};

userSchema.pre("save", async function(next){
    //beacuse of isModified below code execute only when if u want to update password.
    if(this.isModified("password")){
        this.password  = await bcrypt.hash(this.password, 10);
    }
    next();
});

const userModel = new mongoose.model('Register', userSchema);

module.exports = userModel;