import { NextFunction, Request, Response } from 'express';
import AuthService from '../services/auth.service';

const authService: AuthService = new AuthService();

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token: string = req.headers.authorization?.split(' ')[1] as string;

    if (!token) {
      return res.status(401).json({
        message: 'No authorization token provided!',
      });
    }

    const payload = await authService.verifyAccessToken(token);

    (req as any).userPayload = payload;

    next();
  } catch (error: any) {
    return res.status(401).json({
      message: error.message,
    });
  }
};

export const superAdminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    try {
      const userPayload = (req as any).userPayload;

      if (userPayload.role !== 'super-admin') {
        return res.status(401).json({
          message: 'Unauthorized! Only super-admins can access this route!',
        });
      }

      next();
    } catch (error: any) {
      return res.status(401).json({
        message: error.message,
      });
    }
  } catch (error: any) {
    return res.status(401).json({
      message: error.message,
    });
  }
};

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userPayload = (req as any).userPayload;

    if (userPayload.role !== 'admin' || userPayload.role !== 'super-admin') {
      return res.status(401).json({
        message: 'Unauthorized! Only admins can access this route!',
      });
    }

    next();
  } catch (error: any) {
    return res.status(401).json({
      message: error.message,
    });
  }
};
