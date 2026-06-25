import { Router } from 'express';
import { uploadImage } from '../controllers/upload.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { upload } from '../config/multer';
import { Role } from '@prisma/client';

const router = Router();

// Only authenticated users (admins preferred, but left to business logic) can upload
router.post('/', authenticate, requireRole([Role.ADMIN]), upload.single('image'), uploadImage);

export default router;
