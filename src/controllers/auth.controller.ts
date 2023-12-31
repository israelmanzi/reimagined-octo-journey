/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from 'express';
import AuthService from '../services/auth.service';
import UserService from '../services/user.service';
import { HttpsError, ResponseT as R } from '../utils';
import { TUser } from '../db/types';

const authService: AuthService = new AuthService();
const userService: UserService = new UserService();

export const AuthController = {
  login: async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const token = await authService.login(email, password);

    new R('ok', token).sendResponse(req, res);
  },

  refreshToken: async (req: Request, res: Response) => {
    const { userId } = req.params;

    const token = await authService.refreshToken(userId);

    new R('ok', token).sendResponse(req, res);
  },

  create: async (req: Request, res: Response) => {
    const body = req.body as TUser;

    const user = await userService.create(body);

    new R('created', user).sendResponse(req, res);
  },

  verifyAccount: async (req: Request, res: Response) => {
    const { email, verificationCode } = req.query;

    if ((req as any).userPayload.body.email !== email) throw new HttpsError('unauthenticated', 'Unauthorized!');

    await authService.verifyAccount(`${email}`, `${verificationCode}`);

    new R('ok', {
      message: 'Account verified!',
    }).sendResponse(req, res);
  },

  generateVerificationCode: async (req: Request, res: Response) => {
    const { email } = req.query;

    if ((req as any).userPayload.body.email !== email) throw new HttpsError('unauthenticated', 'Unauthorized!');

    const code = await authService.generateVerificationCode(`${email}`);

    new R('created', code).sendResponse(req, res);
  },

  passwordReset: async (req: Request, res: Response) => {
    const { email, passwordResetCode } = req.query;
    const { password } = req.body;

    await authService.passwordReset(`${email}`, `${passwordResetCode}`, password);

    new R('ok', {
      message: 'Password reset!',
    }).sendResponse(req, res);
  },

  generatePasswordResetCode: async (req: Request, res: Response) => {
    const { email } = req.query;

    const code = await authService.generatePasswordResetCode(`${email}`);

    new R('accepted', code).sendResponse(req, res);
  },
};
