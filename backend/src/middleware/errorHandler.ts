import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === 'PrismaClientKnownRequestError') {
    // Handle Prisma specific errors if needed
    statusCode = 400;
    message = 'Database operation failed';
  }

  if (statusCode >= 500) {
    logger.error('Unhandled error:', {
      error: err.message,
      stack: err.stack,
      url: _req.originalUrl,
      method: _req.method,
      ip: _req.ip
    });
  } else {
    logger.warn('App warning:', {
      error: err.message,
      url: _req.originalUrl,
      method: _req.method,
      ip: _req.ip
    });
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};
