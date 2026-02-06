import "node:process";
import mongoose from "mongoose";
import { config } from "dotenv";
config();

// console.log("testing:", process.env);

const db = mongoose
  .connect(process.env.DB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
