import express from "express";
import { authorizeAdmin, isAuthenticated } from "../middlewares/auth.js";
import {
  contact,
  courseRequest,
  getDashboardStats,
} from "../controllers/otherController.js";

const router = express.Router();

//contact form
router.route("/contact").post(contact);

//Course Request form
router.route("/courserequest").post(courseRequest);

//Get Dashboard Stats form
router
  .route("/admin/stats")
  .get(isAuthenticated, authorizeAdmin, getDashboardStats);

export default router;
