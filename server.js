import app from "./app.js";
import { connectDB } from "./config/database.js";

connectDB();

app.listen(process.env.PORT || 5000, () => {
  console.log(`Serving running on port ${process.env.PORT}`);
});
