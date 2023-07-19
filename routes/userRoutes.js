import express from "express";
import { register } from "../controllers/userController.js";

const router = express.Router();

//To register a new usr
router.route("/register").post(register);

//Login
//Logout
//Get my profile

//ChangePassword
//UpdateProfile
//UpdateProfilePicture

//ForgetPassword
//ResetPassword

//AddToPlaylist
//RemoveFromPlaylist
export default router;
