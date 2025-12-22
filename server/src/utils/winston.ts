import "winston-daily-rotate-file";

import { existsSync, mkdirSync } from "fs";
import path from "path";
import winston from "winston";

const { combine, timestamp, printf, colorize, json, errors } = winston.format;
const isProd = process.env.NODE_ENV === "production";

const logDir = path.join(process.cwd(), "logs");

if (!existsSync(logDir)) {
  mkdirSync(logDir, { recursive: true });
}

const transportsList: winston.transport[] = [];

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const consoleFormat = combine(
  colorize({
    colors: { warn: "yellow", error: "red", info: "green", debug: "blue" },
  }),
  timestamp(),
  myFormat,
);

const fileFormat = combine(errors({ stack: true }), timestamp(), json());

if (!isProd) {
  transportsList.push(
    new winston.transports.Console({
      level: "debug",
      format: consoleFormat,
    }),
  );
} else {
  transportsList.push(
    new winston.transports.Console({
      level: "info",
      format: consoleFormat,
    }),
  );

  const fileRotateTransport = new winston.transports.DailyRotateFile({
    filename: path.join(logDir, "application-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    maxFiles: "7d",
    level: "info",
    format: fileFormat,
  });
  transportsList.push(fileRotateTransport);

  const errorFileTransport = new winston.transports.DailyRotateFile({
    filename: path.join(logDir, "error-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    level: "error",
    maxFiles: "7d",
    format: fileFormat,
  });
  transportsList.push(errorFileTransport);
}

const logger = winston.createLogger({
  level: isProd ? "info" : "debug",
  format: isProd ? fileFormat : consoleFormat,
  transports: transportsList,
});

export default logger;
