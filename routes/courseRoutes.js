import express from "express";
import {
  getAllCourses,
  createCourse,
} from "../controllers/courseController.js";

const router = express.Router();

//Get all courses without lectures
router.route("/courses").get(getAllCourses);

//Create a new course only admin
router.route("/createcourse").post(createCourse);

//Add lecture to course, Delete Course, Get Course Details(get all lectures)

//Delete lecture
export default router;
