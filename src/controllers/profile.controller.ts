/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from 'express';
import UserService from '../services/user.service';
import { ResponseT as R } from '../utils';
import { TUserStatus } from '../db/types';
import { UserStatusFactory } from '../db/factories/user';

const userService: UserService = new UserService();

export const ProfileController = {
  get: async (req: Request, res: Response) => {
    const user = await userService.findById((req as any).userPayload.body.id!);

    new R('ok', user).sendResponse(req, res);
  },

  deactivate: async (req: Request, res: Response) => {
    const userId = (req as any).userPayload.body.id!;

    await userService.deactivate(userId);

    new R('ok', {
      message: 'User deactivated!',
    }).sendResponse(req, res);
  },

  updateWithCurrentStatus: async (req: Request, res: Response) => {
    const userId = (req as any).userPayload.body.id!;

    const userStatus = new UserStatusFactory(req.body.userStatus as TUserStatus).getUserStatus();

    const user = await userService.updateUserWithCurrentStatus(userId, userStatus);

    new R('ok', user).sendResponse(req, res);
  },
};
