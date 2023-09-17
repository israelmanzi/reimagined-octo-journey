import { ENV_VARS, HttpsError, comparePasswordAndGenerateNewPassword } from '../../utils';
import { TUser, TUserRole, TUserStatus, TUserWithPassword } from '../types';
import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';
import UserFactory from '../factories/user';
import AnalyticsService from '../../services/analytics.service';

export interface IUserRepository {
  create(user: TUser): Promise<TUserWithPassword>;
  update(id: string, password: string): Promise<TUserWithPassword>;
  deactivate(id: string): Promise<void>;
  findById(id: string): Promise<TUserWithPassword>;
  findByEmail(email: string): Promise<TUserWithPassword>;
  generateRefreshToken(
    {
      userId,
      email,
      role,
    }: {
      userId: string;
      email: string;
      role: TUserRole;
    },
    REFRESH_SECRET: string,
    REFRESH_EXPIRES_IN: number,
  ): Promise<string>;
  verifyAccount(email: string): Promise<void>;
  verificationToken(email: string, code: string): Promise<void>;
  passwordReset(email: string, code: string, password: string): Promise<void>;
  passwordResetToken(email: string, code: string): Promise<void>;
  getActiveUsers(): Promise<TUser[]>;
  getInactiveUsers(): Promise<TUser[]>;
  updateUserWithCurrentStatus(id: string, status: TUserStatus[]): Promise<TUserWithPassword>;
}

export default class UserRepository implements IUserRepository {
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

  async create(_user: TUser): Promise<TUserWithPassword> {
    const { users } = await this.dbConnect();

    if (await users.findOne({ email: _user.email })) throw new HttpsError('already-exists', 'User already exists!');

    const user = new UserFactory(_user).getUser();

    await users.insertOne(user);
    await this.dbDisconnect();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const userWithoutPassword = (({ password, ...rest }) => rest)(user);
    return userWithoutPassword;
  }

  async update(id: string, password: string): Promise<TUserWithPassword> {
    const { users } = await this.dbConnect();

    const user = await users.findOne<TUser>({ id });

    if (!user) throw new HttpsError('not-found', 'User not found!');

    password = await comparePasswordAndGenerateNewPassword(password, user.password);

    await users.updateOne({ id }, { $set: { password } });
    await this.dbDisconnect();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const userWithoutPassword = (({ password, ...rest }) => rest)(user);
    return userWithoutPassword;
  }

  async deactivate(id: string): Promise<void> {
    const { users } = await this.dbConnect();

    const user = await users.findOne<TUser>({ id });

    if (!user) throw new HttpsError('not-found', 'User not found!');
    if (!user.isActive) throw new HttpsError('invalid-argument', 'User already deactivated!');

    await users.updateOne({ id }, { $set: { active: true } });
    await this.dbDisconnect();
  }

  async findById(id: string): Promise<TUserWithPassword> {
    const { users } = await this.dbConnect();

    const user = await users.findOne<TUser>({ id });
    await this.dbDisconnect();

    if (!user) throw new HttpsError('not-found', 'User not found!');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const userWithoutPassword = (({ password, ...rest }) => rest)(user);
    return userWithoutPassword;
  }

  async findByEmail(email: string): Promise<TUser> {
    const { users } = await this.dbConnect();

    const user = await users.findOne<TUser>({ email });
    await this.dbDisconnect();

    if (!user) throw new HttpsError('not-found', 'Invalid email or password!');

    return user;
  }

  async generateRefreshToken(
    {
      userId,
      email,
      role,
    }: {
      userId: string;
      email: string;
      role: TUserRole;
    },
    REFRESH_SECRET: string,
    REFRESH_EXPIRES_IN: number,
  ): Promise<string> {
    const { users } = await this.dbConnect();

    const refreshToken = jwt.sign({ userId, email, role }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });

    await users.updateOne({ id: userId }, { $set: { refreshToken } });

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
      { $set: { password, passwordResetToken: null } },
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

  async getActiveUsers(): Promise<TUser[]> {
    const { users } = await this.dbConnect();

    const usersList = await users.find<TUser>({ isActive: true }).toArray();
    await this.dbDisconnect();

    return usersList;
  }

  async getInactiveUsers(): Promise<TUser[]> {
    const { users } = await this.dbConnect();

    const usersList = await users.find<TUser>({ isActive: false }).toArray();
    await this.dbDisconnect();

    return usersList;
  }

  async updateUserWithCurrentStatus(id: string, status: TUserStatus[]): Promise<TUserWithPassword> {
    const { users } = await this.dbConnect();

    const user = await users.findOne<TUser>({ id });

    if (!user) throw new HttpsError('not-found', 'User not found!');

    const res = await users.updateOne(
      { id },
      {
        $push: {
          userStatus: { $each: status, $position: 0 },
        },
      },
    );
    await this.dbDisconnect();

    if (!res) throw new HttpsError('not-found', 'User not found!');

    const analyticsService = new AnalyticsService();
    await analyticsService.updateLastActive(user.device!.id!);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const userWithoutPassword = (({ password, ...rest }) => rest)(user);
    return userWithoutPassword;
  }
}
