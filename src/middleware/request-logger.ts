import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();

  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { method, originalUrl } = req;
    const { statusCode } = res;

    const logMessage = `${method} ${originalUrl} ${statusCode} - ${duration}ms`;

    if (statusCode >= 500) {
      logger.error(logMessage);
    } else if (statusCode >= 400) {
      logger.warn(logMessage);
    } else {
      logger.info(logMessage);
    }
  });

  next();
};

