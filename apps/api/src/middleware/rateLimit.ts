import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { sendError } from '../utils';

export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    success: false,
    error: 'Too many requests, please try again later',
    message: 'Rate limit exceeded'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    sendError(res, 'Rate limit exceeded', 429, 'Too Many Requests');
  }
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 1000,
  message: {
    success: false,
    error: 'API rate limit exceeded',
    message: 'Too many requests'
  }
});
