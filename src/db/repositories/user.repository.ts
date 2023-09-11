import { ENV_VARS, HttpsError, comparePasswordAndGenerateNewPassword } from '../../utils';
import { TUser } from '../types';
import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';

export interface UserRepositoryPort {
  create(user: TUser): Promise<TUser>;
  update(id: string, password: string): Promise<TUser>;
  deactivate(id: string): Promise<TUser>;
  findById(id: string): Promise<TUser>;
  findByEmail(email: string): Promise<TUser>;
}

export default class UserRepository implements UserRepositoryPort {
  private readonly db: string;
  private readonly client: MongoClient;
  private static instance: UserRepository;

  constructor() {
    this.db = ENV_VARS.DB_URI;
    this.client = new MongoClient(this.db);
  }

  static getInstance() {
    if (UserRepository.instance) {
      return this.instance;
    }
    this.instance = new UserRepository();
    return this.instance;
  }

  async dbConnect() {
    try {
      await this.client.connect();

      const db = this.client.db('myVital');
      const users = db.collection('users');

      return { users };
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

  async create(user: TUser): Promise<TUser> {
    const { users } = await this.dbConnect();

    if (await users.findOne({ email: user.email })) throw new HttpsError('already-exists', 'User already exists!');

    await users.insertOne(user);
    await this.dbDisconnect();

    return user;
  }

  async update(id: string, password: string): Promise<TUser> {
    const { users } = await this.dbConnect();

    const user = await users.findOne<TUser>({ id });

    if (!user) throw new HttpsError('not-found', 'User not found!');

    password = await comparePasswordAndGenerateNewPassword(password, user.password);

    await users.updateOne({ id }, { $set: { password } });
    await this.dbDisconnect();

    return user;
  }

  async deactivate(id: string): Promise<TUser> {
    const { users } = await this.dbConnect();

    const user = await users.findOne<TUser>({ id });

    if (!user) throw new HttpsError('not-found', 'User not found!');

    await users.updateOne({ id }, { $set: { active: false } });
    await this.dbDisconnect();

    return user;
  }

  async findById(id: string): Promise<TUser> {
    const { users } = await this.dbConnect();

    const user = await users.findOne<TUser>({ id });
    await this.dbDisconnect();

    if (!user) throw new HttpsError('not-found', 'User not found!');

    return user;
  }

  async findByEmail(email: string): Promise<TUser> {
    const { users } = await this.dbConnect();

    const user = await users.findOne<TUser>({ email });
    await this.dbDisconnect();

    if (!user) throw new HttpsError('not-found', 'User not found!');

    return user;
  }

  async findRefreshToken(id: string): Promise<{
    refreshToken: string;
    email: string;
  }> {
    const { users } = await this.dbConnect();

    const user = await users.findOne<TUser>({ id });
    await this.dbDisconnect();

    if (!user || !user.refreshToken) throw new HttpsError('not-found', 'User or refreshToken not found!');

    return {
      refreshToken: user.refreshToken,
      email: user.email,
    };
  }

  async generateRefreshToken(
    {
      userId,
      email,
    }: {
      userId: string;
      email: string;
    },
    REFRESH_SECRET: string,
    REFRESH_EXPIRES_IN: number,
  ): Promise<string> {
    const { users } = await this.dbConnect();

    const refreshToken = jwt.sign({ userId, email }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });

    await users.updateOne({ userId }, { $set: { refreshToken } });
    await this.dbDisconnect();

    return refreshToken;
  }

  async verifyAccount(email: string): Promise<void> {
    const { users } = await this.dbConnect();

    await users.updateOne(
      { email },
      {
        $set: {
          isVerified: true,
          verificationToken: null,
        },
      },
    );

    await this.dbDisconnect();
  }

  async verificationToken(email: string, code: string): Promise<void> {
    const { users } = await this.dbConnect();

    const res = await users.updateOne(
      {
        email,
      },
      { $set: { verificationToken: code } },
    );
    await this.dbDisconnect();

    if (!res) throw new HttpsError('not-found', 'User not found!');
  }

  async passwordReset(email: string, code: string, password: string): Promise<void> {
    const { users } = await this.dbConnect();

    const res = await users.updateOne(
      {
        email,
        passwordResetToken: code,
      },
      { $set: { password } },
    );
    await this.dbDisconnect();

    if (!res) throw new HttpsError('not-found', 'User not found!');
  }

  async passwordResetToken(email: string, code: string): Promise<void> {
    const { users } = await this.dbConnect();

    const res = await users.updateOne(
      {
        email,
      },
      { $set: { passwordResetToken: code } },
    );
    await this.dbDisconnect();

    if (!res) throw new HttpsError('not-found', 'User not found!');
  }
}
