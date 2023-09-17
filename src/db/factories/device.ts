import { v4 } from 'uuid';
import { HttpsError } from '../../utils';
import { PassCode, TDevice, TDeviceModel, TDeviceStatusType, TInsurance } from '../types';
import { Name } from './user';

export class DateFactory {
  private readonly date: string;

  constructor(_date: string) {
    if (!Date.parse(_date)) {
      throw new HttpsError('invalid-argument', 'Invalid date');
    }

    this.date = new Date(_date).toLocaleString();
  }

  public getDate(): string {
    return this.date;
  }
}

export class Insurance {
  private readonly name: string;
  private readonly expirationDate: string;

  constructor(name: string, expirationDate: string) {
    this.name = new Name(name).getName();
    this.expirationDate = new DateFactory(expirationDate).getDate();
  }

  public getInsurance(): TInsurance {
    return {
      name: this.name,
      expirationDate: this.expirationDate,
    };
  }
}

export class DeviceStatus {
  private readonly deviceStatus: TDeviceStatusType;

  constructor(_deviceStatus: TDeviceStatusType) {
    if (!['active', 'inactive', 'lost', 'stolen'].includes(_deviceStatus.toLowerCase())) {
      throw new HttpsError('invalid-argument', 'Invalid device status');
    }

    this.deviceStatus = _deviceStatus;
  }

  public getDeviceStatus(): TDeviceStatusType {
    return this.deviceStatus;
  }
}

export class PassCodeFactory {
  private readonly passCode: PassCode<1000, 9999, number>;

  constructor(passCode: PassCode<1000, 9999, number>) {
    if (passCode < 1000 || passCode > 9999 || !Number.isInteger(passCode)) {
      throw new HttpsError('invalid-argument', 'Invalid pass code');
    }

    this.passCode = passCode;
  }

  public getPassCode(): PassCode<1000, 9999, number> {
    return this.passCode;
  }
}

export class DeviceModel {
  private readonly name: string;
  private readonly manufacturer: string;
  private readonly releaseDate: string;
  private readonly lastUpdate: string;
  private readonly price: number;

  constructor(name: string, manufacturer: string, releaseDate: string, lastUpdate: string, price: number) {
    this.name = new Name(name).getName();
    this.manufacturer = new Name(manufacturer).getName();
    this.releaseDate = new DateFactory(releaseDate).getDate();
    this.lastUpdate = new DateFactory(lastUpdate).getDate();

    if (price < 0) {
      throw new HttpsError('invalid-argument', 'Price must be positive');
    }

    this.price = price;
  }

  public getDeviceModel(): TDeviceModel {
    return {
      name: this.name,
      manufacturer: this.manufacturer,
      releaseDate: this.releaseDate,
      lastUpdate: this.lastUpdate,
      price: this.price,
    };
  }
}

export class DeviceFactory {
  private readonly id: string;
  private readonly issuedAt: string;
  private readonly userId: string;
  private readonly insurance: TInsurance;
  private readonly deviceStatus: TDeviceStatusType;
  private readonly lastActive: string;
  private readonly deviceModel: TDeviceModel;
  private readonly passCode: PassCode<1000, 9999, number>;

  constructor({
    issuedAt,
    userId,
    insurance,
    deviceStatus,
    lastActive,
    deviceModel,
    passCode,
  }: {
    issuedAt: string;
    userId: string;
    insurance: TInsurance;
    deviceStatus: TDeviceStatusType;
    lastActive: string;
    deviceModel: TDeviceModel;
    passCode: PassCode<1000, 9999, number>;
  }) {
    this.id = v4();
    this.issuedAt = new DateFactory(issuedAt).getDate();
    this.userId = userId;
    this.insurance = new Insurance(insurance.name, insurance.expirationDate).getInsurance();
    this.deviceStatus = new DeviceStatus(deviceStatus).getDeviceStatus();
    this.lastActive = new DateFactory(lastActive).getDate();
    this.deviceModel = new DeviceModel(
      deviceModel.name,
      deviceModel.manufacturer,
      deviceModel.releaseDate,
      deviceModel.lastUpdate,
      deviceModel.price,
    ).getDeviceModel();
    this.passCode = new PassCodeFactory(passCode).getPassCode();
  }

  public getDevice(): TDevice {
    return {
      id: this.id,
      issuedAt: this.issuedAt,
      userId: this.userId,
      insurance: this.insurance,
      deviceStatus: this.deviceStatus,
      lastActive: this.lastActive,
      deviceModel: this.deviceModel,
      passCode: this.passCode,
    };
  }
}
