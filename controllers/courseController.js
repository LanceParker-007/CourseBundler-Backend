import getDataUri from "../utils/dataUri.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Course } from "../models/Course.js";
import ErrorHandler from "../utils/errorHandler.js";
import cloudinary from "cloudinary";

//Get all courses
export const getAllCourses = catchAsyncError(async (req, res, next) => {
  const courses = await Course.find().select("-lectures");

  res.status(200).json({
    success: true,
    courses,
  });
});

// Create a new Course
export const createCourse = catchAsyncError(async (req, res, next) => {
  const { title, description, category, createdBy } = req.body;

  if (!title || !description || !category || !createdBy)
    return next(new ErrorHandler("Please add all fields", 400));

  const file = req.file;
  console.log(file);
  const fileUri = getDataUri(file); //Get file details through multer and dataUri

  const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);

  await Course.create({
    title,
    description,
    category,
    createdBy,
    poster: { public_id: myCloud.public_id, url: myCloud.url },
  });

  res.status(200).json({
    success: true,
    message: "Course created successfully! You can add lecures now.",
  });
});

// Get Course Details(get all lectures)
export const getCourseLectures = catchAsyncError(async (req, res, next) => {
  const course = await Course.findById(req.params.id); //params matlab ':', and query matlab '?'

  if (!course) return next(new ErrorHandler(`Course not found`, 404));

  course.views += 1;
  await course.save();

  res.status(200).json({
    success: true,
    lectures: course.lectures,
  });
});

//Add lecture to course/:id
export const addLectureToCourse = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { title, description } = req.body;
  // const file = req.file; // Have to use multer

  const course = await Course.findById(id); //params matlab ':', and query matlab '?'
  if (!course) return next(new ErrorHandler(`Course not found`, 404));

  ///Upload file here to cloudinary
  course.lectures.push({
    title,
    description,
    video: { public_id: "url", url: "url" },
  });

  course.numOfVideos = course.lectures.length;
  await course.save();

  res.status(200).json({
    success: true,
    message: `Lecture added to course successfully!`,
  });
});
