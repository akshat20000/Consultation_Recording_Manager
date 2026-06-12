import dotenv from 'dotenv';
import path from 'path';

// Load env variables
dotenv.config({path: path.resolve(__dirname,'../../../.env')});

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/consultation-recording-manager',
  JWT_SECRET: process.env.JWT_SECRET || 'super_secret_astrology_key_13579',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  OPENAI_API_KEY:process.env.OPENAI_API_KEY || '',
};

//check if openai is configured 
export const isOpenAIConfigured = !!env.OPENAI_API_KEY;

// Check if Cloudinary is configured
export const isCloudinaryConfigured = !!(
  env.CLOUDINARY_CLOUD_NAME &&
  env.CLOUDINARY_API_KEY &&
  env.CLOUDINARY_API_SECRET
);
