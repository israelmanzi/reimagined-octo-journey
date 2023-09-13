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
    userId: string;
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

export type FAQ = {
    id?: string;
    question: string;
    answer: string;
}
