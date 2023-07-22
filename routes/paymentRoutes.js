import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import {
  buySubscription,
  getRazorpayKey,
  paymentVerification,
} from "../controllers/paymentController.js";

const router = express.Router();

//Buy Subscription
router.route("/subscribe").get(isAuthenticated, buySubscription);

//Verify Payment and save reference in database or Payment verification
router.route("/paymentverification").post(isAuthenticated, paymentVerification);

//Get Razorpay_Api_Key
router.route("/razorpaykey").get(getRazorpayKey);

//
export default router;
