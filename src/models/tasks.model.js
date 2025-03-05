import mongoose from "mongoose"

const tasksSchema = new mongoose.Schema({
    userId : {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    taskDetails:{
        type: String,
        required: true
    }
},{
    timestamps: true
})

export const Task = mongoose.model("Task",tasksSchema)