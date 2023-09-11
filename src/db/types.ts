export type TUser = {
  id?: string;
  email: string;
  password: string;
  refreshToken?: string;
  isActive?: boolean;
  isVerified?: boolean;
  passwordResetToken?: string;
  verificationToken?: string;
};
