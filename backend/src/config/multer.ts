import multer from 'multer';

import fs from 'fs';
import path from 'path';

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Use local disk storage instead of Cloudinary
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir)
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    // Optionally check for double extensions (e.g., image.php.png)
    const extCount = (file.originalname.match(/\./g) || []).length;
    if (extCount > 1) {
      cb(new Error('Invalid file name. Double extensions are not allowed.'));
    } else {
      cb(null, true);
    }
  } else {
    cb(new Error('Invalid file type! Only JPEG, PNG, and WebP are allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});
