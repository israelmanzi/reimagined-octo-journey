import { v4 } from 'uuid';
import { HttpsError } from '../../utils';
import { hash, genSalt } from 'bcrypt';
import { TDevice, TGender, TUser, TUserRole, TUserStatus } from '../types';

class EmailFactory {
  private readonly email: string;
  regex: RegExp = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;

  constructor(_email: string) {
    if (!this.regex.test(_email)) {
      throw new HttpsError('invalid-argument', 'Invalid email');
    }

    if (_email.length > 5 || _email.length < 20) {
      throw new HttpsError('invalid-argument', 'Email must be between 5 and 20 characters');
    }

    this.email = _email;
  }

  public getEmail(): string {
    return this.email;
  }
}

export class Name {
  private readonly name: string;

  constructor(_name: string) {
    if (_name.length < 2 || _name.length > 20) {
      throw new HttpsError('invalid-argument', 'Name must be between 2 and 20 characters');
    }

    this.name = _name;
  }

  public getName(): string {
    return this.name;
  }
}

export class Location {
  private readonly location: string;

  constructor(_location: string) {
    if (_location.length < 4 || _location.length > 50) {
      throw new HttpsError('invalid-argument', 'Location must be between 4 and 50 characters');
    }

    this.location = _location;
  }

  public getLocation(): string {
    return this.location;
  }
}

export class PhoneNumber {
  private readonly phoneNumber: string;
  regex: RegExp = /^[0-9]+$/;

  constructor(_phoneNumber: string) {
    if (_phoneNumber.length !== 10 || !this.regex.test(_phoneNumber)) {
      throw new HttpsError('invalid-argument', 'Phone number must be valid');
    }

    this.phoneNumber = _phoneNumber;
  }

  public getPhoneNumber(): string {
    return this.phoneNumber;
  }
}

export class IdNumber {
  private readonly idNumber: string;
  regex: RegExp = /^[0-16]+$/;

  constructor(_idNumber: string) {
    if (_idNumber.length !== 13 || !this.regex.test(_idNumber)) {
      throw new HttpsError('invalid-argument', 'ID number must be valid');
    }

    this.idNumber = _idNumber;
  }

  public getIdNumber(): string {
    return this.idNumber;
  }
}

export class DateOfBirth {
  private readonly dateOfBirth: Date;

  constructor(_dateOfBirth: Date) {
    const today = new Date();
    const birthDate = new Date(_dateOfBirth);

    if (today.getFullYear() - birthDate.getFullYear() < 6) {
      throw new HttpsError('invalid-argument', 'User must be 6 years or older');
    }

    this.dateOfBirth = _dateOfBirth;
  }

  public getDateOfBirth(): Date {
    return this.dateOfBirth;
  }
}

export class PasswordFactory {
  private password!: string;

  constructor() {}

  public getPassword(): string {
    return this.password;
  }

  public async setPassword(_password: string): Promise<void> {
    if (_password.length < 8 || _password.length > 20) {
      throw new HttpsError('invalid-argument', 'Password must be between 8 and 20 characters');
    }

    const salt = await genSalt(10);
    this.password = await hash(_password, salt);
  }
}

export class RoleFactory {
  private readonly role: TUserRole;

  constructor(_role: TUserRole) {
    this.role = _role;
  }

  public getRole(): TUserRole {
    return this.role;
  }
}

export class DeviceFactory {
  private readonly device: TDevice;

  constructor(_device: TDevice) {
    this.device = _device;
  }

  public getDevice(): TDevice {
    return this.device;
  }
}

export class UserStatusFactory {
  private readonly userStatus: TUserStatus[];

  constructor(_userStatus: TUserStatus[]) {
    this.userStatus = _userStatus;
  }

  public getUserStatus(): TUserStatus[] {
    return this.userStatus;
  }
}

export class Role {
  private readonly role: TUserRole;

  private isValidRole(_role: TUserRole): boolean {
    return _role === 'user' || _role === 'admin' || _role === 'super-admin';
  }

  constructor(_role: TUserRole) {
    if (!this.isValidRole(_role)) throw new HttpsError('invalid-argument', 'Invalid role');
    this.role = _role;
  }

  public getRole(): TUserRole {
    return this.role;
  }
}

export class Gender {
  private readonly gender: TGender;

  constructor(_gender: TGender) {
    if (_gender !== 'F' && _gender !== 'M' && _gender !== 'O')
      throw new HttpsError('invalid-argument', 'Invalid gender');

    this.gender = _gender;
  }

  public getGender(): TGender {
    return this.gender;
  }
}

export default class UserFactory {
  private readonly id: string;
  private readonly email: string;
  private readonly firstName: string;
  private readonly lastName: string;
  private readonly location: string;
  private readonly gender: TGender;
  private readonly role: TUserRole;
  private readonly device?: TDevice;
  private readonly userStatus: TUserStatus[];
  private readonly dateOfBirth: Date;
  private readonly phoneNumber: string;
  private readonly idNumber?: string;
  private readonly password: string;

  constructor(
    _email: string,
    _password: string,
    _firstName: string,
    _lastName: string,
    _location: string,
    _gender: TGender,
    _role: TUserRole,
    _device: TDevice,
    _userStatus: TUserStatus[],
    _dateOfBirth: Date,
    _phoneNumber: string,
    _idNumber: string,
  ) {
    this.id = v4();
    this.email = new EmailFactory(_email).getEmail();

    this.firstName = new Name(_firstName).getName();
    this.lastName = new Name(_lastName).getName();
    this.location = new Location(_location).getLocation();

    this.gender = new Gender(_gender).getGender();
    this.role = new Role(_role).getRole();
    this.device = new DeviceFactory(_device).getDevice();
    this.userStatus = new UserStatusFactory(_userStatus).getUserStatus();
    this.dateOfBirth = new DateOfBirth(_dateOfBirth).getDateOfBirth();

    this.phoneNumber = new PhoneNumber(_phoneNumber).getPhoneNumber();

    if (_idNumber) this.idNumber = new IdNumber(_idNumber).getIdNumber();

    const passwordFactory = new PasswordFactory();
    passwordFactory.setPassword(_password);
    this.password = passwordFactory.getPassword();
  }

  public getUser(): TUser {
    return {
      id: this.id,
      email: this.email,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName,
      location: this.location,
      gender: this.gender,
      role: this.role,
      device: this.device,
      userStatus: this.userStatus,
      dateOfBirth: this.dateOfBirth,
      phoneNumber: this.phoneNumber,
      idNumber: this.idNumber!,
      isActive: true,
    };
  }
}
