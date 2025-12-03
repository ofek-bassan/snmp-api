import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * Simple API key authentication middleware.
 * - Reads API key from `x-api-key` header or `Authorization: Bearer <key>`.
 * - If `API_KEY` is not set in environment, authentication is disabled (useful for local/dev).
 */
export function apiKeyAuth(req: Request, res: Response, next: NextFunction): void {
  const configuredKey = process.env.API_KEY;

  // If no key configured, skip auth (developer convenience)
  if (!configuredKey) {
    logger.debug('API Key not configured, skipping authentication');
    next();
    return;
  }

  const headerKey = (req.header('x-api-key') || '').trim();
  const authHeader = req.header('authorization') || '';
  let bearerKey = '';
  if (authHeader.toLowerCase().startsWith('bearer ')) {
    bearerKey = authHeader.slice(7).trim();
  }

  const provided = headerKey || bearerKey;

  if (!provided) {
    logger.warn('Missing API key', { path: req.path, method: req.method });
    res.status(401).json({ status: 'error', error: 'Missing API key', timestamp: new Date().toISOString() });
    return;
  }

  if (provided !== configuredKey) {
    logger.warn('Invalid API key', { path: req.path, method: req.method });
    res.status(403).json({ status: 'error', error: 'Invalid API key', timestamp: new Date().toISOString() });
    return;
  }

  // Auth passed
  next();
}

export default apiKeyAuth;
