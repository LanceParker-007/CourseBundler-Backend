import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import { User } from "../models/User.js";
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import { Course } from "../models/Course.js";
import cloudinary from "cloudinary";
import getDataUri from "../utils/dataUri.js";
import { Stats } from "../models/Stats.js";

//Auth
export const register = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;
  const file = req.file;

  if (!name || !email || !password || !file)
    return next(new ErrorHandler("Please enter all fields"), 400);

  let user = await User.findOne({ email });

  if (user) return next(new ErrorHandler("User already exist"), 409);

  const fileUri = getDataUri(file);
  const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);

  //Upload file on cloudinary
  user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: mycloud.public_id,
      url: mycloud.secure_url,
    },
  });

  sendToken(res, user, "Registerd Successfully", 201);
});

export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new ErrorHandler("Please enter all fields"), 400);

  const user = await User.findOne({ email }).select("+password");

  if (!user) return next(new ErrorHandler("User does not exist!"), 401);

  const isMatch = await user.comparePassword(password);

  if (!isMatch)
    return next(new ErrorHandler("Incorrect email or password!"), 401);

  // Send the response with the appropriate header
  res.set("Access-Control-Allow-Credentials", "true");
  sendToken(res, user, `Welcome back, ${user.name}`, 201);
});

export const logout = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .json({
      success: true,
      message: `Logged out successfully`,
    });
});

//Profile
export const getMyProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    user,
  });
});

export const deleteMyProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  //Delete profile picure from cloudinary
  await cloudinary.v2.uploader.destroy(user.avatar.public_id);

  //Cancel subscription

  //Delete profile
  await user.deleteOne();

  //cookie bhi uda denge
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Profile deleted successfully",
    });
});

export const changePassword = catchAsyncError(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return next(new ErrorHandler(`Please enter all fields`, 400));
  }

  const user = await User.findById(req.user._id).select("+password");
  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) {
    return next(new ErrorHandler(`Incorrect old password`, 400));
  }

  // We do need to hash password again because of the presave method we created in User model
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

export const updateProfile = catchAsyncError(async (req, res, next) => {
  const { name, email } = req.body;
  const user = await User.findById(req.user._id).select("+password");

  if (name) user.name = name;
  if (email) user.email = email;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
  });
});

export const updateProfilePicture = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const file = req.file;

  if (!file) {
    return next(new ErrorHandler("Please upload a new image"), 400);
  }

  const fileUri = getDataUri(file);
  const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);

  await cloudinary.v2.uploader.destroy(user.avatar.public_id);

  user.avatar = {
    public_id: mycloud.public_id,
    url: mycloud.secure_url,
  };

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile picture updated successfully",
  });
});

//Forget Password
export const forgetPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return next(new ErrorHandler(`User not found`, 400));

  const resetToken = await user.getResetToken();
  await user.save();

  const resetPasswordUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

  const message = `Click on the link to reset your password. ${resetPasswordUrl}.`;
  // If you have not requested to change your password, please report to us } ${reportUrl};

  //send token via email
  await sendEmail(user.email, `CourseBundler Reset Password`, message);

  res.status(200).json({
    success: true,
    message: `Resend token successfully sent to ${user.email}`,
  });
});

//Reset Password
export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { resetpasswordtoken } = req.params;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetpasswordtoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: {
      $gt: Date.now(),
    },
  });

  if (!user) {
    return next(new ErrorHandler(`Token is invalid or has been expired`));
  }

  user.password = req.body.password; // const {password} = req.body;
  user.resetPasswordExpire = undefined;
  user.resetPasswordToken = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully.",
  });
});

export const addToPlaylist = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const course = await Course.findById(req.body.id); //const {id} = req.body;

  if (!course)
    return next(new ErrorHandler(`Course not found. Invalid course ID!`, 404));

  const itemExist = user.playlist.find((item) => {
    if (item.course.toString() === course._id.toString()) return true; //item.course_id.toString()
  });

  if (itemExist)
    return next(new ErrorHandler(`Course already added to playlist.`, 409));

  user.playlist.push({
    course: course._id, //course_id
    poster: course.poster.url, //posters_url
  });

  await user.save();

  res.status(200).json({
    success: true,
    message: `Course added to playlist`,
  });
});

export const removeFromPlaylist = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const course = await Course.findById(req.query.id); //const {id} = req.body; // req.query.id, a better approach

  if (!course)
    return next(new ErrorHandler(`Course not found. Invalid course ID!`, 404));

  const newPlaylist = user.playlist.filter((item) => {
    if (item.course.toString() !== course._id.toString()) return item; //ite.course_id
  });

  user.playlist = newPlaylist;
  await user.save();

  res.status(200).json({
    success: true,
    message: `Removed from playlist`,
  });
});

// ------Admin Controllers ----------------

//Get all users
export const getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

//Update user role
export const updateUserRole = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new ErrorHandler(`User not found`, 404));

  if (user.role === "user") user.role = "admin";
  else user.role = "user";

  await user.save();

  res.status(200).json({
    success: true,
    message: `User role updated to ${user.role}`,
  });
});

//Delete user
export const deleteUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new ErrorHandler(`User not found`, 404));

  //Remove avatar(user image) from cloudinary
  await cloudinary.v2.uploader.destroy(user.avatar.public_id);

  //Also cancel its subscription

  //delete user
  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: `User deleted successfully`,
  });
});

//Watcher
User.watch().on("change", async () => {
  const stats = await Stats.find({})
    .sort({
      createdAt: "desc",
    })
    .limit(1);

  const subscription = await User.find({
    "subscription.status": "active",
  });

  stats[0].users = await User.countDocuments();
  stats[0].subscription = subscription.length;
  stats[0].createdAt = new Date(Date.now());

  await stats[0].save();
});
