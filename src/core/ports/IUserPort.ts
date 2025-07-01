import { User, UserCreateData, UserUpdateData } from '../entities/User';

export interface IUserPort {
  createUser(data: UserCreateData): Promise<User>;
  findUserById(id: string): Promise<User | null>;
  findUserByEmail(email: string): Promise<User | null>;
  findUserByGoogleId(googleId: string): Promise<User | null>;
  updateUser(id: string, data: UserUpdateData): Promise<User>;
  deleteUser(id: string): Promise<void>;
} 