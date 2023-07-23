import getDataUri from "../utils/dataUri.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Course } from "../models/Course.js";
import ErrorHandler from "../utils/errorHandler.js";
import cloudinary from "cloudinary";
import { Stats } from "../models/Stats.js";

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

  const file = req.file; // multer
  const fileUri = getDataUri(file); //Get file details through multer and dataUri

  const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);

  await Course.create({
    title,
    description,
    category,
    createdBy,
    poster: { public_id: mycloud.public_id, url: mycloud.url },
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

//Add lecture to course/:id (Max video size 100mb)
export const addLectureToCourse = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { title, description } = req.body;

  if (!title || !description)
    return next(new ErrorHandler("Please add all fields", 400));

  const course = await Course.findById(id); //params matlab ':', and query matlab '?'
  if (!course) return next(new ErrorHandler(`Course not found`, 404));

  const file = req.file; // Have to use multer
  const fileUri = getDataUri(file); //dataUri.js
  const mycloud = await cloudinary.v2.uploader.upload(fileUri.content, {
    resource_type: "video",
  });

  ///Upload file here to cloudinary
  course.lectures.push({
    title,
    description,
    video: { public_id: mycloud.public_id, url: mycloud.secure_url },
  });

  course.numOfVideos = course.lectures.length;
  await course.save();

  res.status(200).json({
    success: true,
    message: `Lecture added to course successfully!`,
  });
});

//Delete Course
export const deleteCourse = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const course = await Course.findById(id);
  if (!course) return next(new ErrorHandler(`Course not found`, 404));

  await cloudinary.v2.uploader.destroy(course.poster.public_id);

  for (let i = 0; i < course.lectures.length; i++) {
    const singleLecture = course.lectures[i];
    await cloudinary.v2.uploader.destroy(singleLecture.video.public_id, {
      resource_type: "video",
    });
  }

  await course.deleteOne();

  res.status(200).json({
    success: true,
    message: "Course deleted successfully!",
  });
});

export const deleteLecture = catchAsyncError(async (req, res, next) => {
  const { courseId, lectureId } = req.query;

  const course = await Course.findById(courseId); //params matlab '/:paramName', and query matlab '?key=value'
  if (!course) return next(new ErrorHandler(`Course not found`, 404));

  //get Lecture
  const lecture = course.lectures.filter((item) => {
    if (item._id.toString() === lectureId.toString()) return item;
  });
  //delete lecture video from cloudinary
  await cloudinary.v2.uploader.destroy(lecture[0].video.public_id, {
    resource_type: "video",
  });

  //Upadate course lectures array
  course.lectures = course.lectures.filter((item) => {
    if (item._id.toString() !== lectureId.toString()) return item;
  });

  //Update numOfVideos variable
  course.numOfVideos = course.lectures.length;

  //save course
  await course.save();

  res.status(200).json({
    success: true,
    message: `Lecture deleted successfully`,
  });
});

//Watcher
Course.watch().on("change", async () => {
  const stats = await Stats.find({})
    .sort({
      createdAt: "desc",
    })
    .limit(1);

  const courses = await Course.find({});
  let totalViews = 0;

  for (let index = 0; index < courses.length; index++) {
    totalViews += courses[index].views;
  }

  stats[0].views = totalViews;
  stats[0].createdAt = new Date(Date.now());

  await stats.save();
});
