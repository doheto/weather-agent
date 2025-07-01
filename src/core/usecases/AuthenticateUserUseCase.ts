import { IAuthPort } from '../ports/IAuthPort';
import { GoogleAuthData } from '../entities/AuthSession';

export class AuthenticateUserUseCase {
  constructor(private authPort: IAuthPort) {}

  async authenticateWithGoogle(authData: GoogleAuthData) {
    return this.authPort.authenticateWithGoogle(authData);
  }

  async validateSession(token: string) {
    return this.authPort.validateSession(token);
  }
} 