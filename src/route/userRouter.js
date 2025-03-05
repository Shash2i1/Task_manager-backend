import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { getCurrentUser, loginUser, logoutUser, registerUser } from "../controller/authController.js";
import { addTask, deleteTask, getUserTasks, updateTask } from "../controller/task.controller.js";

const router = Router();

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)

//secure route
router.route("/get-current-user").get(verifyJwt,getCurrentUser)
router.route("/logout").post(verifyJwt,logoutUser)

//Task
router.route("/add-task").post(verifyJwt, addTask)
router.route("/delete-task").post(verifyJwt, deleteTask);
router.route("/fetch-tasks").get(verifyJwt, getUserTasks);
router.route("/update-task").post(verifyJwt,updateTask)




export default router