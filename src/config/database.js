import mongoose from "mongoose";
import env from "./env.js";
import appConfig from "./index.js";
import logger from "./logger.js";

const MONGO_URI = appConfig.mongo.uri || env.getMongoDB_URI();

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(MONGO_URI);
    logger.info(`MongoDB Connected: ${connection.connection.host}`);

    mongoose.connection.on("connected", () => {
      logger.info("Mongoose connected to MongoDB");
    });

    mongoose.connection.on("error", (err) => {
      logger.error("Mongoose connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("Mongoose disconnected from MongoDB");
    });

    return connection;
  } catch (error) {
    logger.error(`Failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
