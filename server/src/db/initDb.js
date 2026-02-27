import "node:process";
import mongoose from "mongoose";
import { config } from "dotenv";
config();

const db = mongoose
  .connect(process.env.DB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

export default db;
