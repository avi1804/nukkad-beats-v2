import jwt from 'jsonwebtoken';
import { User, Role } from '@prisma/client';

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class TokenService {
  private static getSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return secret;
  }

  static generateAccessToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, this.getSecret(), {
      expiresIn: '15m',
      algorithm: 'HS256'
    });
  }

  static generateRefreshToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, this.getSecret(), {
      expiresIn: '7d',
      algorithm: 'HS256'
    });
  }

  static verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.getSecret()) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}
