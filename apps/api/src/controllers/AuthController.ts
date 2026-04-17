import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { authService } from '../services';
import { sendSuccess, sendError } from '../utils';
import { Admin } from '../models';

export class AuthController {
  async login(req: AuthRequest, res: Response): Promise<void> {
    const { email, password } = req.body;

    if (!email || !password) {
      sendError(res, 'Email and password are required', 400, 'Validation Error');
      return;
    }

    const result = await authService.login(email, password);

    if (!result) {
      sendError(res, 'Invalid email or password', 401, 'Authentication Failed');
      return;
    }

    sendSuccess(res, result, 'Login successful');
  }

  async register(req: AuthRequest, res: Response): Promise<void> {
    const { email, password, role } = req.body;

    if (!email || !password) {
      sendError(res, 'Email and password are required', 400, 'Validation Error');
      return;
    }

    if (password.length < 8) {
      sendError(res, 'Password must be at least 8 characters', 400, 'Validation Error');
      return;
    }

    try {
      const admin = await authService.createAdmin(email, password, role);
      sendSuccess(res, admin, 'Admin created successfully', 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      sendError(res, message, 400, 'Registration Failed');
    }
  }

  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    if (!req.admin) {
      sendError(res, 'Authentication required', 401, 'Unauthorized');
      return;
    }

    const admin = await Admin.findById(req.admin.id).select('-password');

    if (!admin) {
      sendError(res, 'Admin not found', 404, 'Not Found');
      return;
    }

    sendSuccess(res, admin, 'Profile retrieved');
  }

  async changePassword(req: AuthRequest, res: Response): Promise<void> {
    if (!req.admin) {
      sendError(res, 'Authentication required', 401, 'Unauthorized');
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      sendError(res, 'Current password and new password are required', 400, 'Validation Error');
      return;
    }

    if (newPassword.length < 8) {
      sendError(res, 'New password must be at least 8 characters', 400, 'Validation Error');
      return;
    }

    try {
      await authService.changePassword(req.admin.id, currentPassword, newPassword);
      sendSuccess(res, null, 'Password changed successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Password change failed';
      sendError(res, message, 400, 'Change Password Failed');
    }
  }
}

export const authController = new AuthController();
