import dotenv from 'dotenv';
dotenv.config();

export const ENV_VARS = {
  MONGO_URI: process.env.MONGO_URI,
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE,
  UPLOAD_PATH: process.env.UPLOAD_PATH,
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE,
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS,
};