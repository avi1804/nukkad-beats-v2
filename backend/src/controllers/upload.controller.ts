import { Request, Response } from 'express';
import { UploadService } from '../services/UploadService';

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image file provided' });
      return;
    }

    // Pass the local file path (from multer) to the Cloudinary service
    const imageUrl = await UploadService.uploadImage(req.file.path);

    res.status(200).json({ url: imageUrl });
  } catch (error: any) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
};
