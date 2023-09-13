import { v4 } from 'uuid';
import { HttpsError } from '../../utils';
import { TDevice, TDeviceModel, TDeviceStatusType, TInsurance } from '../types';
import { Name } from './user';

export class DateFactory {
  private readonly date: Date;

  constructor(_date: Date) {
    this.date = _date;
  }

  public getDate(): Date {
    return this.date;
  }
}

export class Insurance {
  private readonly name: string;
  private readonly expirationDate: Date;

  constructor(name: string, expirationDate: Date) {
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
    if (
      _deviceStatus !== 'active' &&
      _deviceStatus !== 'inactive' &&
      _deviceStatus !== 'lost' &&
      _deviceStatus !== 'stolen'
    ) {
      throw new HttpsError('invalid-argument', 'Invalid device status');
    }

    this.deviceStatus = _deviceStatus;
  }

  public getDeviceStatus(): TDeviceStatusType {
    return this.deviceStatus;
  }
}

export class DeviceModel {
  private readonly name: string;
  private readonly manufacturer: string;
  private readonly releaseDate: Date;
  private readonly lastUpdate: Date;
  private readonly price: number;

  constructor(name: string, manufacturer: string, releaseDate: Date, lastUpdate: Date, price: number) {
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

export class Device {
  private readonly id: string;
  private readonly issuedAt: Date;
  private readonly userId: string;
  private readonly insurance: TInsurance;
  private readonly deviceStatus: TDeviceStatusType;
  private readonly lastActive: DateFactory;
  private readonly deviceModel: TDeviceModel;

  constructor(
    _issuedAt: Date,
    _userId: string,
    _insurance: TInsurance,
    _deviceStatus: TDeviceStatusType,
    _lastActive: Date,
    _deviceModel: TDeviceModel,
  ) {
    this.id = v4();
    this.issuedAt = new DateFactory(_issuedAt).getDate();
    this.userId = _userId;
    this.insurance = new Insurance(_insurance.name, _insurance.expirationDate).getInsurance();
    this.deviceStatus = new DeviceStatus(_deviceStatus).getDeviceStatus();
    this.lastActive = new DateFactory(_lastActive);
    this.deviceModel = new DeviceModel(
      _deviceModel.name,
      _deviceModel.manufacturer,
      _deviceModel.releaseDate,
      _deviceModel.lastUpdate,
      _deviceModel.price,
    ).getDeviceModel();
  }

  public getDevice(): TDevice {
    return {
      id: this.id,
      issuedAt: this.issuedAt,
      userId: this.userId,
      insurance: this.insurance,
      deviceStatus: this.deviceStatus,
      lastActive: this.lastActive.getDate(),
      deviceModel: this.deviceModel,
    };
  }
}
