import { compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserRepository from '../db/repositories/user.repository';
import { comparePasswordAndGenerateNewPassword, ENV_VARS, generateVerificationOrResetCode, HttpsError } from '../utils';
import { TUserRole } from '../db/types';
import MailService from './mail.service';

type LoginRes = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export default class AuthService {
  private readonly userRepository: UserRepository;

  private readonly ACCESS_SECRET: string;
  private readonly REFRESH_SECRET: string;
  private readonly ACCESS_EXPIRES_IN: number;

  constructor() {
    this.userRepository = UserRepository.getInstance();

    this.ACCESS_EXPIRES_IN = Number(ENV_VARS.ACCESS_EXPIRES_IN);
    this.ACCESS_SECRET = ENV_VARS.ACCESS_SECRET;
    this.REFRESH_SECRET = ENV_VARS.REFRESH_SECRET;
  }

  private async generateAuthToken({
    userId,
    email,
    role,
    refreshToken,
  }: {
    userId: string;
    email: string;
    role: TUserRole;
    refreshToken?: string;
  }): Promise<LoginRes> {
    if (!refreshToken) {
      refreshToken = await this.userRepository.generateRefreshToken(
        {
          userId,
          email,
          role,
        },
        this.REFRESH_SECRET,
        this.ACCESS_EXPIRES_IN * 30,
      );
    }

    const accessToken = await this.generateAccessToken({ id: userId, email, role }, refreshToken);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      expiresIn: this.ACCESS_EXPIRES_IN,
    };
  }

  async login(email: string, password: string): Promise<LoginRes> {
    const user = await this.userRepository.findByEmail(email);

    const passwordCompare: boolean = await compare(password, user.password);

    if (!passwordCompare) throw new HttpsError('unauthenticated', 'Invalid email or password!');

    return await this.generateAuthToken({
      userId: user.id!,
      email: user.email,
      role: user.role,
    });
  }

  async refreshToken(userId: string): Promise<LoginRes> {
    const ref = await this.userRepository.findById(userId);

    return await this.generateAuthToken({
      userId,
      email: ref.email,
      role: ref.role,
      refreshToken: ref.refreshToken,
    });
  }

  async generateAccessToken(
    {
      id,
      email,
      role,
    }: {
      id: string;
      email: string;
      role: TUserRole;
    },
    refreshToken: string,
  ): Promise<string> {
    const body = { id, email, role };

    return jwt.sign({ body, refreshToken }, this.ACCESS_SECRET, {
      expiresIn: this.ACCESS_EXPIRES_IN,
    });
  }

  async verifyAccessToken(token: string): Promise<any> {
    const payload = jwt.verify(token, this.ACCESS_SECRET);

    if (!payload) throw new HttpsError('unauthenticated', 'Invalid token!');

    return payload;
  }

  async verifyAccount(email: string, verificationCode: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);

    if (user.isVerified) throw new HttpsError('already-exists', 'User already verified!');

    if (user.verificationToken !== verificationCode)
      throw new HttpsError('unauthenticated', 'Invalid verification code!');

    await this.userRepository.verifyAccount(email);
  }

  async generateVerificationCode(email: string): Promise<{
    callback: string;
    method: string;
  }> {
    const user = await this.userRepository.findByEmail(email);

    if (user.isVerified) throw new HttpsError('already-exists', 'User already verified!');

    const verificationCode = await generateVerificationOrResetCode();

    await this.userRepository.verificationToken(email, verificationCode);

    const mailService = new MailService();

    await mailService.sendMail({
      to: email,
      subject: 'Verify your account',
      context: {
        url: `${ENV_VARS.API_URL}/auth/verify-account?email=${email}&verificationCode=${verificationCode}`,
        code: verificationCode,
      },
    });

    return {
      callback: `${ENV_VARS.API_URL}/auth/verify-account?email=${email}&verificationCode=${verificationCode}`,
      method: 'POST',
    };
  }

  async passwordReset(email: string, passwordResetCode: string, password: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);

    if (user.passwordResetToken !== passwordResetCode)
      throw new HttpsError('unauthenticated', 'Invalid password reset code!');

    await this.userRepository.passwordReset(
      email,
      passwordResetCode,
      await comparePasswordAndGenerateNewPassword(password, user.password!),
    );
  }

  async generatePasswordResetCode(email: string): Promise<{
    callback: string;
    method: string;
  }> {
    await this.userRepository.findByEmail(email);

    const passwordResetCode = await generateVerificationOrResetCode();

    await this.userRepository.passwordResetToken(email, passwordResetCode);

    const mailService = new MailService();

    await mailService.sendMail({
      to: email,
      subject: 'Password reset',
      context: {
        url: `${ENV_VARS.API_URL}/auth/password-reset?email=${email}&passwordResetCode=${passwordResetCode}`,
        code: passwordResetCode,
      },
    });

    return {
      callback: `${ENV_VARS.API_URL}/auth/password-reset?email=${email}&passwordResetCode=${passwordResetCode}`,
      method: 'POST',
    };
  }
}
