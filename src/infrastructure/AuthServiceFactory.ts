import { Pool } from 'pg';
import { UserRepository } from '../adapters/repositories/UserRepository';
import { BetterAuthAdapter } from '../adapters/auth/BetterAuthAdapter';
import { AuthenticateUserUseCase } from '../core/usecases/AuthenticateUserUseCase';

export class AuthServiceFactory {
  static createFromEnv() {
    // Create database connection
    const db = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // Create repositories
    const userRepository = new UserRepository(db);

    // Create adapters
    const authAdapter = new BetterAuthAdapter(userRepository);

    // Create use cases
    const authenticateUserUseCase = new AuthenticateUserUseCase(authAdapter);

    return {
      db,
      userRepository,
      authAdapter,
      authenticateUserUseCase,
    };
  }
} 