export type TUser = {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  location: string;
  gender: TGender;
  role: TUserRole;
  device?: TDevice;
  userStatus: TUserStatus[];
  dateOfBirth: string;
  phoneNumber: string;
  idNumber?: string;
  refreshToken?: string;
  isActive?: boolean;
  isVerified?: boolean;
  passwordResetToken?: string;
  verificationToken?: string;
};

export type TDevice = {
  id?: string;
  issuedAt: string;
  userId: string;
  insurance: TInsurance;
  deviceStatus: TDeviceStatusType;
  lastActive: string;
  deviceModel: TDeviceModel;
  passCode: PassCode<1000, 9999, number>;
};

export type TInsurance = {
  name: string;
  expirationDate: string;
};

export type TUserStatus = {
  temperature: number;
  heartRate: number;
  bloodPressure: number;
  metrics: TMetrics;
  status: TUserStatusType;
  issuedAt: string;
};

export type TMetrics = {
  temperature: 'C' | 'F';
  heartRate: 'bpm';
  bloodPressure: 'mmHg';
};

export type TGender = 'M' | 'F' | 'O';
export type TUserRole = 'user' | 'admin' | 'super-admin';
export type TUserStatusType = 'healthy' | 'sick' | 'critical';
export type TDeviceStatusType = 'active' | 'inactive' | 'lost' | 'stolen';
export type TDeviceModel = {
  name: string;
  manufacturer: string;
  releaseDate: string;
  lastUpdate: string;
  price: number;
};

export type PassCode<Min extends number, Max extends number, Value extends number> = Value extends Min
  ? Min
  : Value extends Max
  ? Max
  : Value;

export type TFAQ = {
  id?: string;
  question: string;
  answer: string;
  category: string;
};

export type TUserWithPassword = Omit<TUser, 'password'>;
