import { Server as SocketIOServer } from 'socket.io';
import { logger } from '../utils/logger';

let io: SocketIOServer | null = null;

export const setIO = (socketIoInstance: SocketIOServer) => {
  io = socketIoInstance;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized');
  }
  return io;
};

/**
 * Emit an event to a specific room or globally
 * @param room The room name to emit to (e.g., 'global', 'role:admin', 'user:123')
 * @param eventName The name of the event to emit
 * @param payload The data payload to send
 */
export const emitEvent = (room: string, eventName: string, payload: any): void => {
  if (!io) {
    logger.warn(`Cannot emit event ${eventName} - Socket.IO not initialized`);
    return;
  }
  
  io.to(room).emit(eventName, payload);
  logger.info(`[Socket Emit] Event: ${eventName} | Room: ${room}`);
};
