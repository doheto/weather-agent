import { User } from '../entities/User';
import { AuthSession, GoogleAuthData, AuthTokens } from '../entities/AuthSession';

export interface IAuthPort {
  // Google OAuth
  authenticateWithGoogle(authData: GoogleAuthData): Promise<{ user: User; session: AuthSession }>;
  
  // Session management
  createSession(userId: string): Promise<AuthSession>;
  validateSession(token: string): Promise<AuthSession | null>;
  revokeSession(sessionId: string): Promise<void>;
  
  // Token management - TODO: move to a separate port ? later
  generateTokens(userId: string): Promise<AuthTokens>;
  refreshTokens(refreshToken: string): Promise<AuthTokens>;
} 