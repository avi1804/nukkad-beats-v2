import { Studio } from '@prisma/client';
import { prisma } from '../utils/prisma';

export class StudioService {
  static async getActiveStudios(): Promise<Studio[]> {
    return prisma.studio.findMany({
      where: { isActive: true }
    });
  }

  static async getStudioById(id: string): Promise<Studio> {
    const studio = await prisma.studio.findUnique({
      where: { id }
    });

    if (!studio) {
      throw new Error('Studio not found');
    }

    return studio;
  }

  static async updateStudio(id: string, data: Partial<Studio>): Promise<Studio> {
    const studio = await prisma.studio.findUnique({
      where: { id }
    });

    if (!studio) {
      throw new Error('Studio not found');
    }

    return prisma.studio.update({
      where: { id },
      data
    });
  }

  // --- Admin Methods ---
  static async getAllStudiosAdmin(): Promise<Studio[]> {
    return prisma.studio.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  static async createStudio(data: any): Promise<Studio> {
    return prisma.studio.create({
      data: {
        name: data.name,
        description: data.description,
        capacity: data.capacity,
        pricePerHour: data.pricePerHour,
        image: data.image,
        isActive: data.isActive !== undefined ? data.isActive : true
      }
    });
  }

  static async deleteStudio(id: string): Promise<void> {
    const studio = await prisma.studio.findUnique({ where: { id } });
    if (!studio) {
      throw new Error('Studio not found');
    }
    
    // We shouldn't actually delete studios if they have bookings, so we could soft delete or throw
    const bookingCount = await prisma.booking.count({ where: { studioId: id } });
    if (bookingCount > 0) {
      throw new Error('Cannot delete studio with existing bookings. Please deactivate it instead.');
    }

    await prisma.studio.delete({ where: { id } });
  }
}

