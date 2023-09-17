import { MongoClient } from 'mongodb';
import { ENV_VARS, HttpsError } from '../../utils';
import { TDevice } from '../types';

export interface IAnalyticsRepository {
  registerDevice(device: TDevice): Promise<TDevice>;
  updateDevice(device: TDevice): Promise<TDevice>;
  deactivateDevice(id: string): Promise<void>;
  getDevice(id: string): Promise<TDevice>;
  findDeviceByUserId(userId: string): Promise<TDevice>;
  getDevices(): Promise<TDevice[]>;
  getActiveDevices(): Promise<TDevice[]>;
  getInactiveDevices(): Promise<TDevice[]>;
  updateLastActive(id: string): Promise<void>;
}

export default class AnalyticsRepository {
  private readonly db: string;
  private readonly client: MongoClient;
  private static instance: AnalyticsRepository;

  constructor() {
    this.db = ENV_VARS.DB_URI;
    this.client = new MongoClient(this.db);
  }

  static getInstance() {
    if (AnalyticsRepository.instance) {
      return this.instance;
    }
    this.instance = new AnalyticsRepository();
    return this.instance;
  }

  async dbConnect() {
    try {
      await this.client.connect();

      const db = this.client.db('myVital');
      const devices = db.collection('devices');
      const users = db.collection('users');

      return { devices, users };
    } catch (error: any) {
      await this.client.close();
      throw new HttpsError('failed-precondition', error.message);
    }
  }

  async dbDisconnect() {
    try {
      await this.client.close();
    } catch (error: any) {
      throw new HttpsError('failed-precondition', error.message);
    }
  }

  async registerDevice(device: TDevice): Promise<TDevice> {
    const { devices, users } = await this.dbConnect();

    await devices.insertOne(device);
    await users.updateOne({ id: device.userId }, { $set: { device } });
    await this.dbDisconnect();

    return device;
  }

  async updateDevice(device: TDevice): Promise<TDevice> {
    const { devices, users } = await this.dbConnect();

    const deviceExists = await devices.findOne<TDevice>({ id: device.id, userId: device.userId });

    if (!deviceExists) throw new HttpsError('not-found', 'Device does not exist!');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, userId, ...rest } = device;

    await devices.updateOne({ id }, { $set: { ...rest } });
    await users.updateOne({ id: device.userId }, { $set: { device } });
    await this.dbDisconnect();

    return device;
  }

  async deactivateDevice(id: string, userId: string): Promise<void> {
    const { devices } = await this.dbConnect();

    const device = await devices.findOne<TDevice>({ id, userId });

    if (!device) throw new HttpsError('not-found', 'Device not found!');
    if (device.deviceStatus === 'inactive') throw new HttpsError('already-exists', 'Device already inactive!');

    await devices.updateOne({ id }, { $set: { deviceStatus: 'inactive' } });
    await this.dbDisconnect();
  }

  async activateDevice(id: string, userId: string): Promise<void> {
    const { devices } = await this.dbConnect();

    const device = await devices.findOne<TDevice>({ id, userId });

    if (!device) throw new HttpsError('not-found', 'Device not found!');
    if (device.deviceStatus === 'active') throw new HttpsError('already-exists', 'Device already active!');

    await devices.updateOne({ id }, { $set: { deviceStatus: 'active' } });
    await this.dbDisconnect();
  }

  async getDevice(id: string): Promise<TDevice> {
    const { devices } = await this.dbConnect();

    const device = await devices.findOne<TDevice>({ id });
    await this.dbDisconnect();

    if (!device) throw new HttpsError('not-found', 'Device not found!');

    return device;
  }

  async findDeviceByUserId(userId: string): Promise<TDevice> {
    const { devices } = await this.dbConnect();

    const device = await devices.findOne<TDevice>({ userId });
    await this.dbDisconnect();

    if (!device) throw new HttpsError('not-found', 'Device not found!');

    return device;
  }

  async getDevices(): Promise<TDevice[]> {
    const { devices } = await this.dbConnect();

    const devicesList = await devices.find<TDevice>({}).toArray();
    await this.dbDisconnect();

    if (!devicesList.length) throw new HttpsError('not-found', 'No devices found!');

    return devicesList;
  }

  async getActiveDevices(): Promise<TDevice[]> {
    const { devices } = await this.dbConnect();

    const devicesList = await devices.find<TDevice>({ deviceStatus: 'active' }).toArray();
    await this.dbDisconnect();

    return devicesList;
  }

  async getInactiveDevices(): Promise<TDevice[]> {
    const { devices } = await this.dbConnect();

    const devicesList = await devices.find<TDevice>({ deviceStatus: 'inactive' }).toArray();
    await this.dbDisconnect();

    return devicesList;
  }

  async updateLastActive(id: string): Promise<void> {
    const { devices } = await this.dbConnect();

    await devices.updateOne({ id }, { $set: { lastActive: new Date().toLocaleString() } });
    await this.dbDisconnect();
  }
}
