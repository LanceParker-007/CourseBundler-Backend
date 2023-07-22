import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import {
  buySubscription,
  cancelSubscription,
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

//Cancel Subscription, authorizedSubscriber
router.route("/subscribe/cancel").delete(isAuthenticated, cancelSubscription);
//
export default router;
