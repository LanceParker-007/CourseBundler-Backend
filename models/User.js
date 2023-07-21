import mongoose from "mongoose";
import validator from "validator";
import jwt from "jsonwebtoken";
import bcrpyt from "bcrypt";
import crypto from "crypto"; // default hota hai node mein

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    validate: validator.isEmail,
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [6, "Password must be at least 6 characters long"],
    select: false,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  subscription: {
    //both fields from razorpay
    id: String,
    status: String,
  },
  avatar: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  playlist: [
    {
      course: {
        //Course_Id
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
      poster: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  resetPasswordToken: String,
  resetPasswordExpire: String,
});

//PreSave or Hash Password
schema.pre("save", async function (next) {
  // const hashedPassword = await bcrpyt.hash(this.password, 10);
  // this.password = hashedPassword;
  //Directly write like this
  if (!this.isModified("password")) return next();
  this.password = await bcrpyt.hash(this.password, 10);
  next();
});

//Generate jwt token
schema.methods.getJWTToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
};

//Compare Password
schema.methods.comparePassword = async function (password) {
  return await bcrpyt.compare(password, this.password);
};

//Generate Reset Token
schema.methods.getResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  //hash resetToken
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 1000 * 60 * 5;

  return resetToken;
};

export const User = mongoose.model("User", schema);
