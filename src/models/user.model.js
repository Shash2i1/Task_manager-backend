import mongoose from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new mongoose.Schema({
    userName : {
        type: String,
        required : true,
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    refreshToken: {
        type : String,
        
    }
},
{timestamps:true})


userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next;

    this.password = await bcrypt.hash(this.password, 10);
    next();
})

//Custom methods related to the user
//Method to verify the password
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

//Method to generate AccessToken
userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        userName : this.userName
    },
    process.env.ACCESSTOKEN_SECRET_KEY,
    {
        expiresIn: process.env.ACCESSTOKEN_EXPIRY
    }
    )
}

//Method to generate refresh token
userSchema.methods.generateRefreshToken =  function(){
    return jwt.sign({
        _id: this._id
    },
    process.env.REFRESHTOKEN_SECRET_KEY,
    {
        expiresIn: process.env.REFRESHTOKEN_EXPIRY
    }
    )
}

export const User = mongoose.model("User",userSchema)