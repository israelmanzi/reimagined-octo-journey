import { v4 } from 'uuid';
import { HttpsError } from '../utils';
import { hash, genSalt } from 'bcrypt';
import { TUser } from '../db/types';

class EmailFactory {
  private email: string;
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

export default class UserFactory {
  private id: string;
  private email: string;
  private password: string;

  constructor(_email: string, _password: string) {
    this.id = v4();
    this.email = new EmailFactory(_email).getEmail();

    const passwordFactory = new PasswordFactory();
    passwordFactory.setPassword(_password);
    this.password = passwordFactory.getPassword();
  }

  public getUser(): TUser {
    return {
      id: this.id,
      email: this.email,
      password: this.password,
      isActive: true,
    };
  }
}
