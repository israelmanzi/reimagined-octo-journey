import { Request, Response } from 'express';
import AnalyticsService from '../services/analytics.service';
import { HttpsError, ResponseT as R } from '../utils';
import { TDevice } from '../db/types';

const analyticsService = new AnalyticsService();

export const AnalyticsController = {
  getAllDevices: async (req: Request, res: Response) => {
    const devices = await analyticsService.getDevices();

    new R('ok', devices).sendResponse(req, res);
  },

  getDeviceById: async (req: Request, res: Response) => {
    const { id } = req.params;

    const device = await analyticsService.getDevice(id);

    new R('ok', device).sendResponse(req, res);
  },

  registerDevice: async (req: Request, res: Response) => {
    const body = req.body as TDevice;
    const userIdFromPayload = (req as any).userPayload.body.id;

    if (body.userId !== userIdFromPayload)
      throw new HttpsError('unauthenticated', 'You are not allowed to register this device!');

    const device = await analyticsService.createDevice(body);

    new R('ok', device).sendResponse(req, res);
  },

  updateDevice: async (req: Request, res: Response) => {
    const body = req.body as TDevice;
    const userIdFromPayload = (req as any).userPayload.body.id;

    if (body.userId !== userIdFromPayload)
      throw new HttpsError('unauthenticated', 'You are not allowed to update this device!');

    const device = await analyticsService.updateDevice(body);

    new R('ok', device).sendResponse(req, res);
  },

  deactivateDevice: async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).userPayload.body.id;

    await analyticsService.deactivateDevice(id, userId);

    new R('ok', null).sendResponse(req, res);
  },

  activateDevice: async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).userPayload.body.id;

    await analyticsService.activateDevice(id, userId);

    new R('ok', null).sendResponse(req, res);
  },

  getActiveDevices: async (req: Request, res: Response) => {
    const devices = await analyticsService.getActiveDevices();

    new R('ok', devices).sendResponse(req, res);
  },

  getInactiveDevices: async (req: Request, res: Response) => {
    const devices = await analyticsService.getInactiveDevices();

    new R('ok', devices).sendResponse(req, res);
  },
};
