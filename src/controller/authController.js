import {User} from "../models/user.model.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"

const option = {
    httpOnly: true,
    secure: true
}


//generate the access and refresh token
const generateAccessAndRefreshToken  = async(userId) =>{
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
    
        user.refreshToken = refreshToken;
        user.save({validateBeforeSave: false})
    
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "something went wrong while generating acces and refresh tokens")
    }
}

//Method to register the user
const registerUser = asyncHandler( async(req,res) =>{

    //extract data from the req body
    const {userName, email, password} = req.body 
    

    //validation
    if(
        [userName,email,password].some((field) => (
            field?.trim() === ""
        ))
    ){
        throw new ApiError(400, "All fields are required");
    }

    //check for existed user
    const existedUser = await User.findOne({email});
    if(existedUser){
        throw new ApiError(409, "User with same email is already existed")
    }

    const user = await User.create({
        userName: userName,
        email: email,
        password: password
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.
    status(200).
    json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    )
})

//Login method
const loginUser = asyncHandler(async(req, res) => {
    const {email, password} = req.body;

    //validate the input
    if(!email || !password){
        throw new ApiError(400, "Email and password required");
    }

    //find the user
    const user = await User.findOne({email});

    if(!user){
        throw new ApiError(404,"User Not exist")
    }
    
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const isPasswordCorrect = await user.isPasswordCorrect(password);
   
    if(!isPasswordCorrect){
        throw new ApiError(401, "Invalid Password");
    }

    const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken")

    return res
    .status(200)
    .cookie("accessToken",accessToken, option)
    .cookie("refreshToken",refreshToken, option)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User Logged In successfully"
        )
    )
})

//get current user method
const getCurrentUser = asyncHandler(async(req,res) => {
    return res
    .status(200)
    .json(
        new ApiResponse(200, req.user, "Current user data fetched successfully")
    )
})

//logout user
const logoutUser = asyncHandler(async(req,res) =>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    return res.
    status(200)
    .clearCookie("accessToken",option)
    .clearCookie("refreshToken",option)
    .json(
        new ApiResponse(200,{},"User logged out ")
    )
})

export {
    registerUser,
    loginUser,
    getCurrentUser,
    logoutUser
}   