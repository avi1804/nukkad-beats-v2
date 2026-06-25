import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { sanitizeObject } from '../utils/sanitize';

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = sanitizeObject(req.body);
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        res.status(400).json({
          error: 'Validation failed',
          details: errorMessages
        });
        return;
      }
      
      res.status(500).json({ error: 'Internal server error during validation' });
    }
  };
};
