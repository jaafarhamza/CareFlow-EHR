import dotenv from "dotenv";

const result = dotenv.config();

if (result.error) {
  throw new Error("Failed to load .env file");
}

// Validate environment variables
const requiredEnvVars = [
  "MONGO_HOST",
  "MONGO_PORT",
  "MONGO_DB",
  "MONGO_INITDB_ROOT_USERNAME",
  "MONGO_INITDB_ROOT_PASSWORD",
  "MONGO_SSL",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export default {
  NODE_ENV: process.env.NODE_ENV,
  PORT: parseInt(process.env.PORT, 10), // switch to number 

  CLIENT_URL: process.env.CLIENT_URL,

  // MongoDB Configuration
  MONGO_HOST: process.env.MONGO_HOST,
  MONGO_PORT: parseInt(process.env.MONGO_PORT, 10),
  MONGO_DB: process.env.MONGO_DB,
  MONGO_INITDB_ROOT_USERNAME: process.env.MONGO_INITDB_ROOT_USERNAME,
  MONGO_INITDB_ROOT_PASSWORD: process.env.MONGO_INITDB_ROOT_PASSWORD,
  MONGO_SSL: process.env.MONGO_SSL, 
  // // URI
  getMongoDB_URI: function () {
    return `mongodb://${this.MONGO_INITDB_ROOT_USERNAME}:${this.MONGO_INITDB_ROOT_PASSWORD}@${this.MONGO_HOST}:${this.MONGO_PORT}/${this.MONGO_DB}?authSource=admin&ssl=${this.MONGO_SSL}`;
  },
};
