import express from "express";
import { config } from "dotenv";
import ErrorMiddleware from "./middlewares/Error.js";
import cookieParser from "cookie-parser";

config({
  path: "./config/config.env",
});

import courseRouter from "./routes/courseRoutes.js";
import userRouter from "./routes/userRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";

const app = express();

//Using middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Importing and Using course routes
app.use("/api/v1", courseRouter);
app.use("/api/v1", userRouter);
app.use("/api/v1", paymentRouter);

export default app;

app.use(ErrorMiddleware);
