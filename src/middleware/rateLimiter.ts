import rateLimit from 'express-rate-limit';
import logger from '../utils/logger';
import { Request, Response } from 'express';

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10); // 1 minute
const max = parseInt(process.env.RATE_LIMIT_MAX || '60', 10); // 60 requests per window by default

export const apiRateLimiter = rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('Rate limit exceeded', { path: req.path, ip: req.ip });
    res.status(429).json({ status: 'error', error: 'Too many requests', timestamp: new Date().toISOString() });
  },
});

export default apiRateLimiter;
