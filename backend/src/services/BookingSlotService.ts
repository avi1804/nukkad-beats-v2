import { prisma } from '../utils/prisma';

export class BookingSlotService {
  static async checkAvailability(studioId: string, date: string, startTime: string, endTime: string): Promise<boolean> {
    const overlappingSlots = await prisma.bookingSlot.findMany({
      where: {
        studioId,
        date: new Date(date),
        isBooked: true,
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } }
            ]
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } }
            ]
          }
        ]
      }
    });

    return overlappingSlots.length === 0;
  }

  static async getBookedSlots(studioId: string, date: string): Promise<any[]> {
    return prisma.bookingSlot.findMany({
      where: {
        studioId,
        date: new Date(date),
        isBooked: true,
      },
      select: {
        startTime: true,
        endTime: true,
      }
    });
  }
}
