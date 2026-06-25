import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/TokenService';
import { prisma } from '../utils/prisma';
import { User, Role } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token = req.cookies?.accessToken;
    
    // Fallback to Bearer token for APIs that might still send it (like mobile app later)
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      res.status(401).json({ error: 'Authentication token is required' });
      return;
    }

    const payload = TokenService.verifyToken(token);
    
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    });

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    if (user.isBlocked) {
      res.status(403).json({ error: 'User account is blocked' });
      return;
    }

    if (user.deletedAt) {
      res.status(403).json({ error: 'User account is deleted' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
};

export const requireRole = (roles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};
