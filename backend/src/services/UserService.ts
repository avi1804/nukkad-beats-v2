import { User } from '@prisma/client';
import { prisma } from '../utils/prisma';

export class UserService {
  static async getProfile(userId: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async updateProfile(userId: string, data: any): Promise<Omit<User, 'passwordHash'>> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: data.fullName,
        phone: data.phone,
        profileImage: data.profileImage
      }
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // --- Preferences ---
  static async getPreferences(userId: string) {
    let prefs = await prisma.userPreferences.findUnique({ where: { userId } });
    if (!prefs) {
      prefs = await prisma.userPreferences.create({ data: { userId } });
    }
    return prefs;
  }

  static async updatePreferences(userId: string, data: any) {
    return await prisma.userPreferences.upsert({
      where: { userId },
      update: {
        bookingEmails: data.bookingEmails,
        promotionalEmails: data.promotionalEmails,
        whatsappReminders: data.whatsappReminders
      },
      create: {
        userId,
        bookingEmails: data.bookingEmails ?? true,
        promotionalEmails: data.promotionalEmails ?? false,
        whatsappReminders: data.whatsappReminders ?? true
      }
    });
  }

  // --- Security ---
  static async updatePassword(userId: string, currentPassword?: string, newPassword?: string) {
    if (!currentPassword || !newPassword) throw new Error('Passwords are required');
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) throw new Error('Cannot update password for this user');
    
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) throw new Error('Incorrect current password');

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash }
    });
    return { success: true };
  }

  // --- Sessions ---
  static async getSessions(userId: string) {
    // Generate some mock active sessions if none exist for demo purposes
    let sessions = await prisma.session.findMany({
      where: { userId },
      orderBy: { lastActive: 'desc' }
    });
    
    if (sessions.length === 0) {
      // Seed initial session
      const newSession = await prisma.session.create({
        data: {
          userId,
          device: "Current Device",
          browser: "Chrome",
          location: "Unknown",
          ipAddress: "127.0.0.1",
          isCurrent: true
        }
      });
      sessions = [newSession];
    }
    return sessions;
  }

  static async revokeSession(userId: string, sessionId: string) {
    if (sessionId === 'all') {
      await prisma.session.deleteMany({
        where: { userId, isCurrent: false }
      });
      return { success: true };
    }
    await prisma.session.delete({
      where: { id: sessionId, userId }
    });
    return { success: true };
  }

  // --- Account Deletion ---
  static async deleteAccount(userId: string) {
    // Soft delete
    await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        isBlocked: true, // effectively blocking login
        email: `deleted_${Date.now()}_${userId}@deleted.com` // anonymize email
      }
    });
    
    // Revoke all sessions
    await prisma.session.deleteMany({ where: { userId } });
    return { success: true };
  }

  // --- Admin Methods ---
  static async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isBlocked: true,
        createdAt: true,
        _count: {
          select: { bookings: true, orders: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async updateUserStatus(userId: string, isBlocked: boolean) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isBlocked }
    });
    
    // If blocked, optionally revoke sessions
    if (isBlocked) {
      await prisma.session.deleteMany({ where: { userId } });
    }
    
    return user;
  }
}

