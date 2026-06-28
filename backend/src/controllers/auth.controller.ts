import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { TokenService } from '../services/TokenService';
import { emitEvent } from '../socket/emitter';
import { SESSION_INVALIDATED } from '../socket/events';

const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const payload = TokenService.verifyToken(token);
      emitEvent(`user:${payload.userId}`, SESSION_INVALIDATED, {});
    } catch (e) {
      // ignore token parse errors during logout
    }
  }
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logged out successfully' });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await AuthService.register(req.body);
    setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
    res.status(201).json({ user: result.user });
  } catch (error: any) {
    if (error.message === 'Email is already registered') {
      res.status(409).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await AuthService.login(req.body);
    setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
    res.status(200).json({ user: result.user });
  } catch (error: any) {
    if (error.message === 'Invalid email or password') {
      res.status(401).json({ error: error.message });
      return;
    }
    if (error.message === 'Account is blocked' || error.message === 'Account is deleted') {
      res.status(403).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      res.status(400).json({ error: 'Access token is required' });
      return;
    }
    const result = await AuthService.googleLogin(accessToken);
    setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
    res.status(200).json({ user: result.user });
  } catch (error: any) {
    if (error.message === 'Account is blocked' || error.message === 'Account is deleted') {
      res.status(403).json({ error: error.message });
      return;
    }
    res.status(401).json({ error: error.message });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      res.status(401).json({ error: 'Refresh token is missing' });
      return;
    }
    
    const tokens = await AuthService.refreshToken(refreshToken);
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    res.status(200).json({ message: 'Token refreshed successfully' });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }
    await AuthService.forgotPassword(email);
    res.status(200).json({ message: 'Verification code sent to your email.' });
  } catch (error: any) {
    if (error.message === 'No account found with this email.') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      res.status(400).json({ error: 'Email and OTP are required' });
      return;
    }
    const result = await AuthService.verifyOTP(email, otp);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      res.status(400).json({ error: 'Reset token and new password are required' });
      return;
    }
    await AuthService.resetPassword(resetToken, newPassword);
    res.status(200).json({ message: 'Password reset successful.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
