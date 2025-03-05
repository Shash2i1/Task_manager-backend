import {Task} from "../models/tasks.model.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import mongoose from "mongoose"

const addTask = asyncHandler(async (req, res) =>{
    //extract the user id from cookie

    const {taskDetails} = req.body;
    if(!taskDetails){
        throw new ApiError(400,"task details should not be empty");
    }

    const response = await Task.create({
        userId: req.user._id,
        taskDetails: taskDetails
    })

    if(!response){
        throw new ApiError(400, "Something went wrong while adding task");
    }

    return res.status(200)
    .json(
        new ApiResponse(200, {},"Task added successfully")
    )
})

//delete task method
const deleteTask = asyncHandler( async(req, res) =>{
    const {taskId} = req.body;

    if(!taskId){
        throw new ApiError(400, "Requested task doesn't exist");
    }


    //delete the task
    const response = await Task.findByIdAndDelete({_id: taskId});
    
    //check if task exist or not
    if(!response){
        throw new ApiError(400, "Requested task doesn't exist")
    }
    
    return res.
    status(200)
    .json(
        new ApiResponse(400,response,"Task Deleted successfully")
    )
})

//get user tasks
const getUserTasks = asyncHandler(async (req, res) => {
    const _id = req.user?._id;  // Get _id from authenticated user

    if (!mongoose.Types.ObjectId.isValid(_id)) {
        throw new ApiError(400, "Invalid User ID format");
    }

    const userTasks = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(_id),
            },
        },
        {
            $lookup: {
                from: "tasks",
                localField: "_id",
                foreignField: "userId",
                as: "usertasks",
            },
        },
        {
            $project: {
                _id: 1,
                "usertasks._id": 1,
                "usertasks.taskDetails": 1,
                "usertasks.createdAt": 1,
            },
        },
    ]);

    if (!userTasks.length) {
        return res.status(200).json(new ApiResponse(200, [], "No tasks found"));
    }

    return res.status(200).json(new ApiResponse(200, userTasks, "User Tasks fetched successfully"));
});


//update task
const updateTask = asyncHandler(async(req,res) => {
    const {taskId, taskDetails} = req.body;

    if(!taskId){
        throw new ApiError(400, "requested task is not exist")
    }

    const updatedTask = await Task.findOneAndUpdate(
        { _id: taskId },
        { taskDetails: taskDetails },
        { new: true, runValidators: true }
    ).select("-__v")
   
    if(!updatedTask){
        throw new ApiError(404,"Task not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,updatedTask,"Task updated successfully")
    )
})
export {
    addTask,
    deleteTask,
    getUserTasks,
    updateTask
}