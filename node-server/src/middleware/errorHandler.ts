import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { SnmpError } from '../types/snmp';

export class ErrorHandler {
  static handle(error: Error, req: Request, res: Response, next: NextFunction): void {
    logger.error('Request error', {
      path: req.path,
      method: req.method,
      error: error.message,
      stack: error.stack,
    });

    if (error instanceof SnmpError) {
      res.status(error.statusCode).json({
        status: 'error',
        error: error.message,
        errorCode: error.errorCode,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Default error response
    res.status(500).json({
      status: 'error',
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString(),
    });
  }

  static notFound(req: Request, res: Response): void {
    logger.warn('Route not found', { path: req.path, method: req.method });
    res.status(404).json({
      status: 'error',
      error: 'Route not found',
      path: req.path,
      timestamp: new Date().toISOString(),
    });
  }
}

export default ErrorHandler;
