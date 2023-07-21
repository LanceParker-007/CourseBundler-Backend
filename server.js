import app from "./app.js";
import { connectDB } from "./config/database.js";
import cloudinary from "cloudinary";

try {
  connectDB(); //Function to connect database

  //Cloudinary config, connecting to cloudinary
  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
    api_key: process.env.CLOUDINARY_CLIENT_API_KEY,
    api_secret: process.env.CLOUDINARY_CLIENT_API_SECRET,
  });

  app.listen(process.env.PORT || 5000, () => {
    // Function to start/listen server
    console.log(`Serving running on port ${process.env.PORT}`);
  });
} catch (error) {
  console.log(error);
}
