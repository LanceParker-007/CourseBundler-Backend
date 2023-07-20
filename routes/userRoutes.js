import express from "express";
import { login, logout, register } from "../controllers/userController.js";

const router = express.Router();

//To register a new usr
router.route("/register").post(register);

//Login
router.route("/login").post(login);

//Logout
router.route("/logout").get(logout);

//Get my profile

//ChangePassword
//UpdateProfile
//UpdateProfilePicture

//ForgetPassword
//ResetPassword

//AddToPlaylist
//RemoveFromPlaylist
export default router;
