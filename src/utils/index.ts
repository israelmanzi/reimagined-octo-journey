import { Request, Response } from 'express';
import { v1 } from 'uuid';
import { compare } from 'bcrypt';
import dotenv from 'dotenv';
import winston from 'winston';
import { PasswordFactory } from '../db/factories/user';

export const logger = winston.createLogger({
  levels: winston.config.syslog.levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.cli(),
    winston.format.colorize({ all: true }),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' }),
  ],
  exitOnError: false,
});

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

    return new PasswordFactory(unhashed).getPassword();
  } catch (error: any) {
    throw new HttpsError('failed-precondition', error.message);
  }
}

export async function generateVerificationOrResetCode(): Promise<string> {
  try {
    return v1({
      nsecs: 163,
      node: [0x01, 0x23, 0x45, 0x67, 0x89, 0xab],
    });
  } catch (error: any) {
    throw new HttpsError('failed-precondition', error.message);
  }
}

export class ResponseT {
  private readonly code: SuccessCode;
  private readonly retBody: any;

  constructor(
    public _code: SuccessCode,
    public _retBody: any,
  ) {
    this.code = _code;
    this.retBody = _retBody;
  }

  public sendResponse(req: Request, res: Response) {
    switch (this.code) {
      case 'ok':
        res.status(200).json(this.retBody);
        break;
      case 'created':
        res.status(201).json(this.retBody);
        break;
      case 'accepted':
        res.status(202).json(this.retBody);
        break;
      case 'no-content':
        res.status(204).json(this.retBody);
        break;
      case 'multi-status':
        res.status(207).json(this.retBody);
        break;
      case 'already-reported':
        res.status(208).json(this.retBody);
        break;
      default:
        res.status(500).json(this.retBody);
    }
  }
}
