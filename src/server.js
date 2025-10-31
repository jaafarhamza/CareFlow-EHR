import app from "./app.js";
import connectDB from "./config/database.js";
import config from "./config/index.js";
import logger from "./config/logger.js";
import { startReminderJob } from "./jobs/reminder.job.js";
import storageService from "./services/storage.service.js";

const PORT = config.port;

const startServer = async () => {
  try {
    await connectDB();

    // Initialize storage (create bucket if needed)
    try {
      await storageService.initialize();
      logger.info('Storage service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize storage service:', error);
      logger.warn('Server will continue but file uploads may not work');
    }

    const server = app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      
      // Start appointment reminder
      try {
        startReminderJob();
        logger.info('Reminder job started successfully');
      } catch (error) {
        logger.error('Failed to start reminder job:', error);
      }
    });

    server.on("error", (error) => {
      logger.error("Server error:", error);
      process.exit(1);
    });

    const shutdown = (signal) => {
      logger.warn(`Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
      });
      // Force exit 
      setTimeout(() => process.exit(1), 10000).unref();
    };

    process.on("unhandledRejection", (err) => {
      logger.error("Unhandled Rejection:", err);
      shutdown("unhandledRejection");
    });
    process.on("uncaughtException", (err) => {
      logger.error("Uncaught Exception:", err);
      shutdown("uncaughtException");
    });
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
