import { cloudinary } from '../config/cloudinary';
import { isCloudinaryConfigured } from '../config/env';
import { ApiError } from '../utils/ApiError';
import fs from 'fs';

export class CloudinaryService {
  /**
   * Upload an audio file to Cloudinary
   * Returns url and publicId
   */
  static async uploadAudio(filePath: string): Promise<{ url: string; publicId: string }> {
    if (!isCloudinaryConfigured) {
      throw new ApiError(500, 'Cloudinary is not configured');
    }

    try {
      const result = await cloudinary.uploader.upload(filePath, {
        resource_type: 'video', // Audio files are uploaded as video resource type in Cloudinary
        folder: 'consultation_recordings',
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error: any) {
      console.error('[Cloudinary Upload Error]:', error);
      throw new ApiError(500, `Failed to upload audio to Cloudinary: ${error.message || error}`);
    }
  }

  /**
   * Delete an audio file from Cloudinary
   */
  static async deleteAudio(publicId: string): Promise<void> {
    if (!isCloudinaryConfigured) {
      return; // If not configured, ignore deletion (as fallback is local files)
    }

    try {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: 'video',
      });
    } catch (error: any) {
      console.error('[Cloudinary Deletion Error]:', error);
      // We don't throw an error here to prevent blocking db deletions
    }
  }
}
