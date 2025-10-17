import logger from "../config/logger.js";

export default function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const isProd = (process.env.NODE_ENV || "").toLowerCase() === "production";
  const message = status === 500 && isProd ? "Internal Server Error" : (err.message || "Error");
  logger.error(message, { status, path: req.path, method: req.method, stack: err.stack });
  const payload = { success: false, message };
  if (!isProd && err.stack) {
    payload.stack = err.stack;
  }
  res.status(status).json(payload);
}


