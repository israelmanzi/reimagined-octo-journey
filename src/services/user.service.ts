import UserRepository, { UserRepositoryPort } from '../db/repositories/user.repository';
import { TUser } from '../db/types';

export default class UserService {
  private readonly userRepository: UserRepositoryPort;

  constructor() {
    this.userRepository = UserRepository.getInstance();
  }

  async create(_user: TUser): Promise<Omit<TUser, 'password'>> {
    return await this.userRepository.create(_user);
  }

  async update(id: string, password: string): Promise<Omit<TUser, 'password'>> {
    return await this.userRepository.update(id, password);
  }

  async deactivate(id: string): Promise<void> {
    return await this.userRepository.deactivate(id);
  }

  async findById(id: string): Promise<Omit<TUser, 'password'>> {
    return await this.userRepository.findById(id);
  }
}
