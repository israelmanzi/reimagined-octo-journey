import UserRepository, { IUserRepository } from '../db/repositories/user.repository';
import { TUser, TUserStatus, TUserWithPassword } from '../db/types';

export default class UserService {
  private readonly userRepository: IUserRepository;

  constructor() {
    this.userRepository = UserRepository.getInstance();
  }

  async create(_user: TUser): Promise<TUserWithPassword> {
    return await this.userRepository.create(_user);
  }

  async update(id: string, password: string): Promise<TUserWithPassword> {
    return await this.userRepository.update(id, password);
  }

  async deactivate(id: string): Promise<void> {
    return await this.userRepository.deactivate(id);
  }

  async findById(id: string): Promise<TUserWithPassword> {
    return await this.userRepository.findById(id);
  }

  async updateUserWithCurrentStatus(id: string, status: TUserStatus[]): Promise<TUserWithPassword> {
    return await this.userRepository.updateUserWithCurrentStatus(id, status);
  }
}
