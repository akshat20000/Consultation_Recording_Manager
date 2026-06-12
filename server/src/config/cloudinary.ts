import { v2 as cloudinary } from 'cloudinary';
import { env, isCloudinaryConfigured } from './env';

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
  console.log('[Upload] Cloudinary configured successfully.');
} else {
  console.log(env);
  console.warn('[Upload Warning] Cloudinary credentials not configured. Server will fall back to local file storage.');
}

export { cloudinary };
