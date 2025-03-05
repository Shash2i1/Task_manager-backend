import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { ApiError } from "./utils/ApiError.js";

const app = express();

//configure the cors
app.use(cors({
    credentials: true,
    origin: process.env.CORS_ORIGIN ,
    methods: "GET,POST,PUT,DELETE",
}))

//configure cookie parser
app.use(cookieParser());

//json data limit
app.use(express.json({limit: "16kb"}))

//urlencoded
app.use(express.urlencoded({extended: true, limit: "16kb"}))


//import route and setup
import userRouter from "./route/userRouter.js"

app.use("/api/v1/user/",userRouter)


app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors || [],
        });
    }

    // Handle other unexpected errors
    console.error("Unhandled Error:", err);
    return res.status(500).json({
        success: false,
        message: "Internal Server Error",
    });
});
export {app}