import dotenv from 'dotenv';
import { compare } from 'bcrypt';
import { PasswordFactory } from '../factories/user';
import { v1 } from 'uuid';

type EnvVars = {
  [key: string]: string;
};

export type ErrorCode =
  | 'invalid-argument'
  | 'not-found'
  | 'already-exists'
  | 'permission-denied'
  | 'unauthenticated'
  | 'failed-precondition'
  | 'aborted'
  | 'out-of-range'
  | 'unimplemented'
  | 'internal'
  | 'unavailable'
  | 'data-loss';

export type SuccessCode = 'ok' | 'created' | 'accepted' | 'no-content' | 'multi-status' | 'already-reported';

export const ENV_VARS = dotenv.config().parsed as EnvVars;

export class HttpsError extends Error {
  code: ErrorCode;

  constructor(
    public _code: ErrorCode,
    message: string,
  ) {
    super(message);
    this.code = _code;

    Object.setPrototypeOf(this, HttpsError.prototype);
  }
}

export async function comparePasswordAndGenerateNewPassword(unhashed: string, hashed: string) {
  try {
    if (await compare(unhashed, hashed)) throw new HttpsError('invalid-argument', 'You cannot use the same password!');

    const passwordFactory = new PasswordFactory();
    await passwordFactory.setPassword(unhashed);
    const _password = passwordFactory.getPassword();

    return _password;
  } catch (error: any) {
    throw new HttpsError('failed-precondition', error.message);
  }
}

export async function generateVerificationOrResetCode(): Promise<string> {
  try {
    const code = v1({
      nsecs: 163,
      node: [0x01, 0x23, 0x45, 0x67, 0x89, 0xab],
    });

    return code;
  } catch (error: any) {
    throw new HttpsError('failed-precondition', error.message);
  }
}

export class Response {
  private code: SuccessCode;
  private retBody: any;

  constructor(
    public _code: SuccessCode,
    public _retBody: any,
  ) {
    this.code = _code;
    this.retBody = _retBody;
  }

  public sendResponse(): { status: number; body: any; message: string } {
    switch (this.code) {
      case 'ok':
        return { status: 200, body: this.retBody, message: 'OK' };
      case 'created':
        return { status: 201, body: this.retBody, message: 'Created' };
      case 'accepted':
        return { status: 202, body: this.retBody, message: 'Accepted' };
      case 'no-content':
        return { status: 204, body: this.retBody, message: 'No Content' };
      case 'multi-status':
        return { status: 207, body: this.retBody, message: 'Multi-Status' };
      case 'already-reported':
        return { status: 208, body: this.retBody, message: 'Already Reported' };
    }
  }
}
