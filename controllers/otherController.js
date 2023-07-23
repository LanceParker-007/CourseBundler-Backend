import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sendEmail } from "../utils/sendEmail.js";
import { Stats } from "../models/Stats.js";

// Contact Form
export const contact = catchAsyncError(async (req, res, next) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message)
    return next(new ErrorHandler(`Fill all fields`, 400));

  const to = process.env.MY_MAIL;
  const subject = "Contact from CourseBundler";
  const text = `I am ${name} and my Email is ${email}. \n ${message}`;

  await sendEmail(to, subject, text);

  res.status(200).json({
    success: true,
    message: `Your message has been sent 👍`,
  });
});

//Course Request Form
export const courseRequest = catchAsyncError(async (req, res, next) => {
  const { name, email, course } = req.body;

  if (!name || !email || !course)
    return next(new ErrorHandler(`Fill all fields`, 400));

  const to = process.env.MY_MAIL;
  const subject = "Request for a new course!";
  const text = `I am ${name} and my Email is ${email}. \n ${course}`;

  await sendEmail(to, subject, text);

  res.status(200).json({
    success: true,
    message: `Your request has been sent 😊`,
  });
});

//Get Dashboard Stats (Only for admin)
export const getDashboardStats = catchAsyncError(async (req, res, next) => {
  const stats = await Stats.find().sort({ createdAt: "desc" }).limit(12);

  const statsData = [];
  const requiredSize = 12 - stats.length;

  for (let index = 0; index < stats.length; index++) {
    statsData.unshift(stats[index]); // unshift se starting mein add karte hain
  }
  for (let index = 0; index < requiredSize; index++) {
    statsData.unshift({
      users: 0,
      subscription: 0,
      views: 0,
    });
  }

  //---- Storing last month usersCount, subscriptionCount
  const usersCount = statsData[11].users;
  const subscriptionCount = statsData[11].subscription;
  const viewsCount = statsData[11].views;

  //usersProfit
  let usersPercentage = true,
    subscriptionPercentage = true,
    viewsPercentage = true;

  let usersProfit = true,
    subscriptionProfit = true,
    viewsProfit = true;

  if (statsData[10].users === 0) usersPercentage = usersCount * 100;
  if (statsData[10].subscription === 0)
    subscriptionPercentage = usersCount * 100;
  if (statsData[10].views === 0) viewsPercentage = usersCount * 100;
  else {
    const difference = {
      users: statsData[11].users - statsData[10].users,
      subscription: statsData[11].subscription - statsData[10].subscription,
      views: statsData[11].views - statsData[10].views,
    };

    usersPercentage = (difference.users / statsData[10].users) * 100;
    subscriptionPercentage =
      (difference.users / statsData[10].subscription) * 100;
    viewsPercentage = (difference.users / statsData[10].views) * 100;

    if (usersPercentage < 0) usersProfit = false;
    if (subscriptionPercentage < 0) subscriptionProfit = false;
    if (viewsPercentage < 0) viewsProfit = false;
  }

  //---
  res.status(200).json({
    success: true,
    stats: statsData,
    viewsCount,
    subscriptionCount,
    viewsCount,
    usersPercentage,
    subscriptionPercentage,
    viewsPercentage,
    usersProfit,
    subscriptionProfit,
    viewsProfit,
  });
});
