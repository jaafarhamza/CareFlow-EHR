import winston from "winston";
import config from "./index.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transports = [
  // Console logging
  new winston.transports.Console({
    level: config.log.level,
    format: config.log.pretty
      ? winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp(),
          winston.format.printf(({ level, message, timestamp, ...meta }) => {
            const rest = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
            return `${timestamp} ${level}: ${message}${rest}`;
          })
        )
      : winston.format.combine(winston.format.timestamp(), winston.format.json()),
  }),
  
  // File logging - All logs
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/combined.log'),
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  
  // File logging - Error logs only
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  
  // File logging - Reminder job logs (custom)
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/reminders.log'),
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
      winston.format((info) => {
        // Only log reminder-related messages
        if (info.message && (
          info.message.includes('reminder') || 
          info.message.includes('Reminder') ||
          info.message.includes('appointment-reminder')
        )) {
          return info;
        }
        return false;
      })()
    ),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

const logger = winston.createLogger({
  level: config.log.level,
  transports,
});

export default logger;


