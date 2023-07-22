import express from "express";
import {
  getAllCourses,
  createCourse,
  getCourseLectures,
  addLectureToCourse,
  deleteCourse,
  deleteLecture,
} from "../controllers/courseController.js";
import singleUpload from "../middlewares/multer.js";
import {
  authorizeAdmin,
  authorizeSubscribers,
  isAuthenticated,
} from "../middlewares/auth.js";

const router = express.Router();

//Get all courses without lectures
router.route("/courses").get(getAllCourses);

//Create a new course only admin
router
  .route("/createcourse")
  .post(isAuthenticated, authorizeAdmin, singleUpload, createCourse);

//Get Course Details(get all lectures), Add lecture to course, Delete Course
router
  .route("/course/:id")
  .get(isAuthenticated, authorizeSubscribers, getCourseLectures)
  .post(isAuthenticated, authorizeAdmin, singleUpload, addLectureToCourse)
  .delete(isAuthenticated, authorizeAdmin, deleteCourse);

//Delete lecture from course
router.route("/lecture").delete(isAuthenticated, authorizeAdmin, deleteLecture);

export default router;
