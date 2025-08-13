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
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  FRONTEND_URL: process.env.FRONTEND_URL,
};