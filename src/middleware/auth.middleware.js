import { User } from "../models/user.model.js"
import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"

export const verifyJwt = asyncHandler(async (req, _, next) => {
    try {
        console.log("Cookies:", req.cookies);
        console.log("Authorization Header:", req.header("Authorization"));

        //extract the access token from the req
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESSTOKEN_SECRET_KEY)

        const user = await User.findById(decodedToken?._id)
            .select("-password -refreshToken")

        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }

        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }

})