import express from "express";
import {
  addToPlaylist,
  changePassword,
  forgetPassword,
  getMyProfile,
  login,
  logout,
  register,
  removeFromPlaylist,
  resetPassword,
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
router.route("/forgetpassword").post(forgetPassword);
//ResetPassword
router.route("/resetpassword/:resetpasswordtoken").put(resetPassword);

//AddToPlaylist
router.route("/addtoplaylist").post(isAuthenticated, addToPlaylist);

//RemoveFromPlaylist
router.route("/removefromplaylist").delete(isAuthenticated, removeFromPlaylist);

//Admin Routes
export default router;
