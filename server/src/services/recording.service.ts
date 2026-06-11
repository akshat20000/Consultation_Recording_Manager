import fs from 'fs';
import path from 'path';
import { isCloudinaryConfigured } from '../config/env';
import { CloudinaryService } from './cloudinary.service';

export class RecordingService {
  /**
   * Save recorded audio, uploading to Cloudinary if available, otherwise saving locally
   */
  static async uploadRecording(
    localFilePath: string
  ): Promise<{ url: string; publicId?: string }> {
    const filename = path.basename(localFilePath);

    if (isCloudinaryConfigured) {
      try {
        console.log(`[Upload] Uploading ${filename} to Cloudinary...`);
        const cloudResult = await CloudinaryService.uploadAudio(localFilePath);

        // Delete temporary file from local disk
        if (fs.existsSync(localFilePath)) {
          fs.unlinkSync(localFilePath);
          console.log(`[Upload] Temporary file deleted: ${filename}`);
        }

        return {
          url: cloudResult.url,
          publicId: cloudResult.publicId,
        };
      } catch (error) {
        console.error('[Upload Fallback] Cloudinary upload failed. Falling back to local file path.', error);
        // Fallback to local URL if upload fails
        return {
          url: `/uploads/${filename}`,
        };
      }
    }

    // Default to local storage serving URL
    console.log(`[Upload] Using local storage serving URL for ${filename}`);
    return {
      url: `/uploads/${filename}`,
    };
  }

  /**
   * Delete recorded audio file
   */
  static async deleteRecording(url: string, publicId?: string): Promise<void> {
    if (publicId) {
      await CloudinaryService.deleteAudio(publicId);
    } else if (url.startsWith('/uploads/')) {
      const filename = url.replace('/uploads/', '');
      const localFilePath = path.join('./uploads', filename);
      if (fs.existsSync(localFilePath)) {
        try {
          fs.unlinkSync(localFilePath);
          console.log(`[Upload] Local file deleted: ${filename}`);
        } catch (error) {
          console.error(`[Upload Delete Error]: Could not delete local file ${filename}:`, error);
        }
      }
    }
  }
}
