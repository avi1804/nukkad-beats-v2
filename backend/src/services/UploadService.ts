import cloudinary from '../config/cloudinary';
import fs from 'fs';

export class UploadService {
  /**
   * Uploads a local file to Cloudinary and deletes the local file
   * @param localFilePath The path to the temporary local file saved by Multer
   * @returns The secure URL of the uploaded image
   */
  static async uploadImage(localFilePath: string): Promise<string> {
    try {
      // Upload the image
      const result = await cloudinary.uploader.upload(localFilePath, {
        folder: 'nukkad_beats',
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      });

      // Once uploaded successfully, delete the temporary local file
      fs.unlink(localFilePath, (err) => {
        if (err) {
          console.error(`Failed to delete temporary file at ${localFilePath}:`, err);
        }
      });

      return result.secure_url;
    } catch (error) {
      // Clean up the local file even if Cloudinary upload fails
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload image to Cloudinary');
    }
  }
}
