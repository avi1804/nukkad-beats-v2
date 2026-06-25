import { cloudinary } from '../config/cloudinary';

export class UploadService {
  static async uploadBuffer(buffer: Buffer, folder: string = 'nukkad-beats'): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) return reject(error);
          if (result) return resolve(result.secure_url);
          reject(new Error('Unknown upload error'));
        }
      );
      uploadStream.end(buffer);
    });
  }

  static async uploadBase64(base64Image: string, folder: string = 'nukkad-beats'): Promise<string> {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder
    });
    return result.secure_url;
  }
}
