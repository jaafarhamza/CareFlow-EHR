import mongoose from "mongoose";
import config from "./env.js";

const MONGO_URI = config.getMongoDB_URI();

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(MONGO_URI);
    console.log(`MongoDB Connected: ${connection.connection.host}`);

    mongoose.connection.on("connected", () => {
      console.log("Mongoose connected to MongoDB");
    });

    mongoose.connection.on("error", (err) => {
      console.error("Mongoose connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("Mongoose disconnected from MongoDB");
    });

    return connection;
  } catch (error) {
    console.error(`Failed to connect to MongoDB:`, error.message);
    process.exit(1);
  }
};

export default connectDB;
