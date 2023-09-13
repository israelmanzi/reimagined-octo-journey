import UserRepository, { UserRepositoryPort } from '../db/repositories/user.repository';
import { TUser } from '../db/types';
import UserFactory from '../db/factories/user';

export default class UserService {
  private readonly userRepository: UserRepositoryPort;

  constructor() {
    this.userRepository = UserRepository.getInstance();
  }

  async create(_user: TUser): Promise<TUser> {
    const user = new UserFactory(_user).getUser();

    return this.userRepository.create(user);
  }

  async update(id: string, password: string): Promise<TUser> {
    return this.userRepository.update(id, password);
  }

  async deactivate(id: string): Promise<TUser> {
    return this.userRepository.deactivate(id);
  }

  async findById(id: string): Promise<TUser> {
    return this.userRepository.findById(id);
  }
}
