import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Admin } from '../models';
import { sendError } from '../utils';

export interface AuthRequest extends Request {
  admin?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'Access token is required', 401, 'Unauthorized');
      return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'default-secret';

    const decoded = jwt.verify(token, secret) as {
      id: string;
      email: string;
      role: string;
    };

    const admin = await Admin.findById(decoded.id).select('-password');

    if (!admin) {
      sendError(res, 'Admin not found', 401, 'Unauthorized');
      return;
    }

    if (!admin.isActive) {
      sendError(res, 'Account is deactivated', 403, 'Forbidden');
      return;
    }

    req.admin = {
      id: admin._id.toString(),
      email: admin.email,
      role: admin.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      sendError(res, 'Token has expired', 401, 'Unauthorized');
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      sendError(res, 'Invalid token', 401, 'Unauthorized');
      return;
    }
    sendError(res, 'Authentication failed', 500, 'Server Error');
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      sendError(res, 'Authentication required', 401, 'Unauthorized');
      return;
    }

    if (!roles.includes(req.admin.role)) {
      sendError(res, 'Insufficient permissions', 403, 'Forbidden');
      return;
    }

    next();
  };
};
