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

    await authService.verifyAccessToken(token);

    next();
  } catch (error: any) {
    return res.status(401).json({
      message: error.message,
    });
  }
};
