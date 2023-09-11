/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from 'express';
import UserService from '../services/user.service';
import { Response as R } from '../utils';

const userService: UserService = new UserService();

export const ProfileController = {
  get: async (req: Request, res: Response) => {
    const { userId } = req.params;

    const user = await userService.findById(userId);

    new R('ok', user).sendResponse();
  },

  deactivate: async (req: Request, res: Response) => {
    const { userId } = req.params;

    await userService.deactivate(userId);

    new R('ok', 'User deactivated!').sendResponse();
  },
};
