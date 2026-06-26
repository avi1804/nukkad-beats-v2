import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { TokenService } from '../services/TokenService';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';
import { setIO } from './emitter';

export const initSocketServer = (httpServer: HttpServer) => {
  const allowedOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : ['http://localhost:5173', 'http://localhost:3000'];

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 60000,
  });

  // Store the instance in our emitter module
  setIO(io);

  // Authentication Middleware
  io.use(async (socket: Socket, next) => {
    try {
      let token = socket.handshake.auth?.token || socket.handshake.query?.token;
      
      // If token is not provided in auth/query, try parsing from cookies
      if (!token && socket.request.headers.cookie) {
        const match = socket.request.headers.cookie.match(/(?:^|;\s*)accessToken=([^;]*)/);
        if (match) {
          token = match[1];
        }
      }

      if (!token) {
        return next(new Error('Authentication error: Token required'));
      }

      const payload = TokenService.verifyToken(token as string);
      
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, role: true, isBlocked: true, deletedAt: true }
      });

      if (!user || user.isBlocked || user.deletedAt) {
        return next(new Error('Authentication error: Invalid or blocked user'));
      }

      // Attach user info to socket
      socket.data.user = {
        id: user.id,
        role: user.role
      };

      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection Handler
  io.on('connection', (socket: Socket) => {
    const user = socket.data.user;
    
    // 1. Join user-specific room
    socket.join(`user:${user.id}`);
    
    // 2. Join role-specific room
    if (user.role) {
      socket.join(`role:${user.role.toLowerCase()}`);
    }
    
    // 3. Join global room
    socket.join('global');

    logger.info(`[Socket Connected] User: ${user.id} | Role: ${user.role} | SocketID: ${socket.id}`);

    socket.on('disconnect', (reason) => {
      logger.info(`[Socket Disconnected] User: ${user.id} | SocketID: ${socket.id} | Reason: ${reason}`);
    });
  });

  return io;
};
