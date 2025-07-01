import { IAuthPort } from '../../core/ports/IAuthPort';
import { IUserPort } from '../../core/ports/IUserPort';
import { User } from '../../core/entities/User';
import { AuthSession, GoogleAuthData, AuthTokens } from '../../core/entities/AuthSession';
import { auth } from '../../config/auth';
import { v4 as uuidv4 } from 'uuid';

export class BetterAuthAdapter implements IAuthPort {
  constructor(private userPort: IUserPort) {}

  async authenticateWithGoogle(authData: GoogleAuthData): Promise<{ user: User; session: AuthSession }> {
    // Check if user exists
    let user = await this.userPort.findUserByGoogleId(authData.googleId);
    
    if (!user) {
      // Check by email as fallback
      user = await this.userPort.findUserByEmail(authData.email);
      
      if (user) {
        // Link Google ID to existing user
        const updateData: any = { googleId: authData.googleId };
        if (authData.picture) updateData.picture = authData.picture;
        
        user = await this.userPort.updateUser(user.id, updateData);
      } else {
        // Create new user
        const createData: any = {
          email: authData.email,
          googleId: authData.googleId,
        };
        if (authData.name) createData.name = authData.name;
        if (authData.picture) createData.picture = authData.picture;
        
        user = await this.userPort.createUser(createData);
      }
    }
    
    // Create session
    const session = await this.createSession(user.id);
    
    return { user, session };
  }

  async createSession(userId: string): Promise<AuthSession> {
    const sessionId = uuidv4();
    const token = await this.generateSessionToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    // In a real implementation, you'd store this in your session storage
    const session: AuthSession = {
      id: sessionId,
      userId,
      token,
      expiresAt,
      createdAt: new Date(),
    };
    
    return session;
  }

  async validateSession(token: string): Promise<AuthSession | null> {
    // In real implementation, validate with BetterAuth
    // For now, this is a placeholder
    return null;
  }

  async revokeSession(sessionId: string): Promise<void> {
    // Revoke session implementation
  }

  async generateTokens(userId: string): Promise<AuthTokens> {
    // Generate JWT tokens
    const accessToken = await this.generateSessionToken();
    const refreshToken = await this.generateSessionToken();
    
    return {
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1 hour
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    // Refresh token implementation
    return this.generateTokens('userId'); // Placeholder
  }

  private async generateSessionToken(): Promise<string> {
    // Generate a secure random token
    return uuidv4();
  }
} 