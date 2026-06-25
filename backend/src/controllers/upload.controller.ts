import { Request, Response } from 'express';


export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image file provided' });
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || `http://${process.env.HOST || 'localhost'}:${process.env.PORT || 5000}`;
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

    res.status(200).json({ url: imageUrl });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to upload image' });
  }
};
