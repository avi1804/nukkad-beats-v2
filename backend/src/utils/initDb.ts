
import { prisma } from './prisma';

export const initializeDatabase = async (): Promise<void> => {
  try {
    // Simply test the database connection by running a simple query
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    console.error('❌ Failed to connect to the database:', error);
    process.exit(1);
  }
};
