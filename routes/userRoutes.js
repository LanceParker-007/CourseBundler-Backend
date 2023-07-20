import express from "express";
import {
  changePassword,
  getMyProfile,
  login,
  logout,
  register,
  updateProfile,
  updateProfilePicture,
} from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

//To register a new usr
router.route("/register").post(register);

//Login
router.route("/login").post(login);

//Logout
router.route("/logout").get(logout);

//Get my profile
router.route("/me").get(isAuthenticated, getMyProfile);

//ChangePassword
router.route("/changepassword").put(isAuthenticated, changePassword);

//UpdateProfile
router.route("/updateprofile").put(isAuthenticated, updateProfile);

//UpdateProfilePicture
router
  .route("/updateprofilepicture")
  .put(isAuthenticated, updateProfilePicture);

//ForgetPassword
//ResetPassword

//AddToPlaylist
//RemoveFromPlaylist
export default router;
