import express from "express";
import { config } from "dotenv";
import courseRouter from "./routes/courseRoutes.js";
import userRouter from "./routes/userRoutes.js";
import ErrorMiddleware from "./middlewares/Error.js";

config({
  path: "./config/config.env",
});

const app = express();

//Importing and using routes
app.use("/api/v1", courseRouter);
app.use("/api/v1", userRouter);

export default app;

app.use(ErrorMiddleware);
