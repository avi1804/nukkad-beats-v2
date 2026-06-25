import { Router } from 'express';
import { register, login, logout, refresh, forgotPassword, googleLogin, verifyOTP, resetPassword } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validate';
import { registerSchema, loginSchema } from '../utils/schemas';
import { loginLimiter, registerLimiter, forgotPasswordLimiter } from '../middleware/rateLimiter';

const router = Router();
router.post('/register', registerLimiter, validateRequest(registerSchema), register);
router.post('/login', loginLimiter, validateRequest(loginSchema), login);
router.post('/logout', logout);
router.post('/google', googleLogin);
router.post('/refresh', refresh);
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

export default router;
