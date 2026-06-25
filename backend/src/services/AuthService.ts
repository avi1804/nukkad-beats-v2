import { User, Role, AuthProvider } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { AuthUtils } from '../utils/auth';
import { TokenService, TokenPair } from './TokenService';
import { EmailService } from './EmailService';

export class AuthService {
  static async register(data: any): Promise<{ user: Omit<User, 'passwordHash'>; tokens: TokenPair }> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('Email is already registered');
    }

    const passwordHash = await AuthUtils.hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        passwordHash,
        role: Role.USER
      }
    });

    const accessToken = TokenService.generateAccessToken(user);
    const refreshToken = TokenService.generateRefreshToken(user);

    // Fire and forget welcome email
    EmailService.sendWelcomeEmail(user);

    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens: { accessToken, refreshToken }
    };
  }

  static async login(data: any): Promise<{ user: Omit<User, 'passwordHash'>; tokens: TokenPair }> {
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (user.isBlocked) {
      throw new Error('Account is blocked');
    }

    if (user.deletedAt) {
      throw new Error('Account is deleted');
    }

    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      throw new Error('Account is temporarily locked due to too many failed attempts. Try again later.');
    }

    if (!user.passwordHash) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await AuthUtils.comparePassword(data.password, user.passwordHash);

    if (!isPasswordValid) {
      const newAttempts = user.failedLoginAttempts + 1;
      let lockoutUntil = null;
      if (newAttempts >= 5) {
        lockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock
      }
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: newAttempts, lockoutUntil }
      });
      throw new Error('Invalid email or password');
    }

    // Reset attempts on successful login
    if (user.failedLoginAttempts > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockoutUntil: null }
      });
    }

    const accessToken = TokenService.generateAccessToken(user);
    const refreshToken = TokenService.generateRefreshToken(user);

    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens: { accessToken, refreshToken }
    };
  }

  static async googleLogin(accessToken: string): Promise<{ user: Omit<User, 'passwordHash'>; tokens: TokenPair }> {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      if (!response.ok) {
        throw new Error('Invalid Google access token');
      }

      const payload = (await response.json()) as { email: string; name?: string; picture?: string };
      
      if (!payload || !payload.email) {
        throw new Error('Invalid Google token payload');
      }

      const { email, name, picture } = payload;

      let user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        // Create new user
        user = await prisma.user.create({
          data: {
            fullName: name || 'Google User',
            email,
            profileImage: picture,
            authProvider: AuthProvider.GOOGLE,
            isVerified: true,
            role: Role.USER
          }
        });
        
        // Send welcome email asynchronously
        EmailService.sendWelcomeEmail(user);
      } else {
        // User exists, just ensure they are not blocked or deleted
        if (user.isBlocked) {
          throw new Error('Account is blocked');
        }
        if (user.deletedAt) {
          throw new Error('Account is deleted');
        }

        // Safely link the Google account (update profile image if missing)
        if (!user.profileImage && picture) {
          user = await prisma.user.update({
            where: { email },
            data: { profileImage: picture }
          });
        }
      }

      const clientAccessToken = TokenService.generateAccessToken(user);
      const clientRefreshToken = TokenService.generateRefreshToken(user);

      const { passwordHash: _, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        tokens: { accessToken: clientAccessToken, refreshToken: clientRefreshToken }
      };
    } catch (error: any) {
      console.error('Google login error detail:', error);
      if (error.message === 'Account is blocked' || error.message === 'Account is deleted') {
        throw error;
      }
      throw new Error(`Google authentication failed: ${error.message}`);
    }
  }

  static async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      const payload = TokenService.verifyToken(refreshToken);
      
      const user = await prisma.user.findUnique({
        where: { id: payload.userId }
      });

      if (!user || user.isBlocked || user.deletedAt) {
        throw new Error('Invalid user state');
      }

      const newAccessToken = TokenService.generateAccessToken(user);
      const newRefreshToken = TokenService.generateRefreshToken(user);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  static async forgotPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.isBlocked || user.deletedAt) {
      throw new Error('No account found with this email.');
    }

    // Invalidate previous active OTPs
    await prisma.passwordReset.updateMany({
      where: { userId: user.id, isUsed: false },
      data: { isUsed: true }
    });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = await AuthUtils.hashPassword(otp); // reuse bcrypt helper
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        hashedOTP,
        expiresAt
      }
    });

    await EmailService.sendPasswordResetOTP(user, otp);
  }

  static async verifyOTP(email: string, otp: string): Promise<{ resetToken: string }> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.isBlocked || user.deletedAt) {
      throw new Error('Invalid request.');
    }

    const resetRecord = await prisma.passwordReset.findFirst({
      where: { userId: user.id, isUsed: false },
      orderBy: { createdAt: 'desc' }
    });

    if (!resetRecord) {
      throw new Error('No active reset request found.');
    }

    if (resetRecord.expiresAt < new Date()) {
      throw new Error('Verification code has expired.');
    }

    if (resetRecord.attemptCount >= 5) {
      await prisma.passwordReset.update({ where: { id: resetRecord.id }, data: { isUsed: true } });
      throw new Error('Too many failed attempts. Please request a new code.');
    }

    const isValid = await AuthUtils.comparePassword(otp, resetRecord.hashedOTP);
    if (!isValid) {
      await prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { attemptCount: { increment: 1 } }
      });
      throw new Error('Invalid verification code.');
    }

    // OTP is valid, mark as used
    await prisma.passwordReset.update({ where: { id: resetRecord.id }, data: { isUsed: true } });

    // Generate a short-lived token to authorize password reset (valid for 5 mins)
    const resetToken = TokenService.generateAccessToken(user); // Reusing access token but we could make a specific one. For now, we will verify it's the right user later.
    return { resetToken };
  }

  static async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    try {
      // Verify token
      const payload = TokenService.verifyToken(resetToken);
      
      const user = await prisma.user.findUnique({ where: { id: payload.userId } });
      if (!user || user.isBlocked || user.deletedAt) {
        throw new Error('Invalid user state.');
      }

      const passwordHash = await AuthUtils.hashPassword(newPassword);

      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash }
      });

      // Invalidate all active sessions (force logout)
      await prisma.session.deleteMany({
        where: { userId: user.id }
      });

      // Send confirmation email
      await EmailService.sendPasswordResetConfirmation(user);
    } catch (error: any) {
      throw new Error('Invalid or expired reset token. Please start over.');
    }
  }
}
