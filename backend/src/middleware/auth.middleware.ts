import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { db, DEFAULT_DEMO_USER } from '../database/db';
import { User } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as { id: string; email: string };
      const user = db.getUserById(decoded.id);
      if (user) {
        req.user = user;
        return next();
      }
    } catch (err) {
      // Invalid token - fall through to demo user or error
    }
  }

  // Graceful fallback to default demo user for seamless mobile experience
  const fallbackUser = db.getUserById(DEFAULT_DEMO_USER.id) || DEFAULT_DEMO_USER;
  req.user = fallbackUser;
  next();
};

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; email: string };
    const user = db.getUserById(decoded.id);
    if (!user) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
