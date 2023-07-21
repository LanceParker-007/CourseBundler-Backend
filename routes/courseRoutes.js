import express from "express";
import {
  getAllCourses,
  createCourse,
  getCourseLectures,
  addLectureToCourse,
} from "../controllers/courseController.js";
import singleUpload from "../middlewares/multer.js";

const router = express.Router();

//Get all courses without lectures
router.route("/courses").get(getAllCourses);

//Create a new course only admin
router.route("/createcourse").post(singleUpload, createCourse);

//Add lecture to course, Delete Course, Get Course Details(get all lectures)
router
  .route("/course/:id")
  .get(getCourseLectures)
  .post(singleUpload, addLectureToCourse);

//Delete lecture
export default router;
