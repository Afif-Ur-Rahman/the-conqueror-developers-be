import mongoose from "mongoose";

import { DB_URI } from "@/constants/env";
import { LOGUI } from "@/constants/logs";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    console.log(LOGUI.FgGreen, "MongoDB already connected");
    return;
  }

  try {
    await mongoose.connect(DB_URI, {
      maxPoolSize: 20,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 10000, // Increased
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      w: "majority",
    });

    console.log(LOGUI.FgGreen, "MongoDB connected successfully");
  } catch (error: any) {
    console.error(LOGUI.FgRed, `MongoDB connection error:`, error.message || error);
  }
};

const gracefulShutdown = async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed due to app termination");
  process.exit(0);
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

export { connectDB };
