import { Admin } from '../models';
import { IAdmin } from '../types';
import jwt from 'jsonwebtoken';
import { logger } from '../utils';

export class AuthService {
  async login(
    email: string,
    password: string
  ): Promise<{
    token: string;
    admin: Omit<IAdmin, 'password'>;
  } | null> {
    const admin = await Admin.findOne({ email: email.toLowerCase() });

    if (!admin) {
      logger.warn(`Failed login attempt for email: ${email}`);
      return null;
    }

    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      logger.warn(`Failed login attempt for email: ${email} - invalid password`);
      return null;
    }

    if (!admin.isActive) {
      logger.warn(`Login attempt for deactivated account: ${email}`);
      return null;
    }

    admin.lastLogin = new Date();
    await admin.save();

    const secret = process.env.JWT_SECRET || 'default-secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    const token = jwt.sign(
      {
        id: admin._id.toString(),
        email: admin.email,
        role: admin.role
      },
      secret,
      { expiresIn }
    );

    logger.info(`Admin logged in: ${email}`);

    return {
      token,
      admin: {
        _id: admin._id.toString(),
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt
      }
    };
  }

  async createAdmin(
    email: string,
    password: string,
    role: 'super-admin' | 'editor' = 'editor'
  ): Promise<IAdmin> {
    const existing = await Admin.findOne({ email: email.toLowerCase() });

    if (existing) {
      throw new Error('Email already in use');
    }

    const admin = new Admin({
      email: email.toLowerCase(),
      password,
      role
    });

    await admin.save();
    logger.info(`New admin created: ${email} with role ${role}`);

    return {
      _id: admin._id.toString(),
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt
    } as IAdmin;
  }

  async changePassword(
    adminId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> {
    const admin = await Admin.findById(adminId);

    if (!admin) {
      throw new Error('Admin not found');
    }

    const isMatch = await admin.comparePassword(currentPassword);

    if (!isMatch) {
      throw new Error('Current password is incorrect');
    }

    admin.password = newPassword;
    await admin.save();

    logger.info(`Password changed for admin: ${admin.email}`);
    return true;
  }
}

export const authService = new AuthService();
