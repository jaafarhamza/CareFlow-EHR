import winston from "winston";
import config from "./index.js";

const transports = [
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
];

const logger = winston.createLogger({
  level: config.log.level,
  transports,
});

export default logger;


