import { DeviceFactory } from '../db/factories/device';
import AnalyticsRepository from '../db/repositories/analytics.repository';
import UserRepository from '../db/repositories/user.repository';
import { TDevice } from '../db/types';
import { HttpsError } from '../utils';

export default class AnalyticsService {
  private readonly deviceRepository: AnalyticsRepository;
  private readonly userRepository: UserRepository;

  constructor() {
    this.deviceRepository = AnalyticsRepository.getInstance();
    this.userRepository = UserRepository.getInstance();
  }

  async getDevices(): Promise<TDevice[]> {
    return await this.deviceRepository.getDevices();
  }

  async getDevice(id: string): Promise<TDevice> {
    return await this.deviceRepository.getDevice(id);
  }

  async createDevice(_device: TDevice): Promise<TDevice> {
    const device = new DeviceFactory(_device).getDevice();

    const user = await this.userRepository.findById(device.userId);

    if (!user) throw new HttpsError('not-found', 'User not found!');
    if (user.role !== 'user') throw new HttpsError('unauthenticated', 'You are not allowed to register a device!');

    return await this.deviceRepository.registerDevice(device);
  }

  async updateDevice(_device: TDevice): Promise<TDevice> {
    const device = new DeviceFactory(_device).getDevice();

    const user = await this.userRepository.findById(device.userId);

    if (!user) throw new HttpsError('not-found', 'User not found!');

    return await this.deviceRepository.updateDevice(device);
  }

  async deactivateDevice(id: string, userId: string) {
    return await this.deviceRepository.deactivateDevice(id, userId);
  }

  async activateDevice(id: string, userId: string) {
    return await this.deviceRepository.activateDevice(id, userId);
  }

  async getActiveDevices(): Promise<TDevice[]> {
    return await this.deviceRepository.getActiveDevices();
  }

  async getInactiveDevices(): Promise<TDevice[]> {
    return await this.deviceRepository.getInactiveDevices();
  }

  async updateLastActive(id: string) {
    return await this.deviceRepository.updateLastActive(id);
  }
}
