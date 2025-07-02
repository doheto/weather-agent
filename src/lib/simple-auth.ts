const jwt = require('jsonwebtoken');
import { Request, Response, NextFunction } from 'express';

// Simple JWT auth without ES module conflicts
export class SimpleAuth {
  private secret: string;
  private googleClientId: string;
  private googleClientSecret: string;
  private baseURL: string;

  constructor() {
    this.secret = process.env.AUTH_SECRET || 'fallback-secret';
    this.googleClientId = process.env.GOOGLE_CLIENT_ID || '';
    this.googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    this.baseURL = process.env.BASE_URL || 'https://weather-agent-backend.vercel.app';
  }

  // Generate JWT token
  generateToken(user: any): string {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        name: user.name 
      },
      this.secret,
      { expiresIn: '7d' }
    );
  }

  // Verify JWT token
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.secret);
    } catch (error) {
      return null;
    }
  }

  // Middleware to protect routes
  requireAuth(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.replace('Bearer ', '') || 
                  req.cookies?.auth_token;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = this.verifyToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    (req as any).user = user;
    next();
  }

  // Google OAuth login URL
  getGoogleAuthURL(): string {
    const params = new URLSearchParams({
      client_id: this.googleClientId,
      redirect_uri: `${this.baseURL}/api/auth/callback/google`,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent'
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  // Exchange Google code for user info
  async handleGoogleCallback(code: string): Promise<any> {
    try {
      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: this.googleClientId,
          client_secret: this.googleClientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: `${this.baseURL}/api/auth/callback/google`
        })
      });

      const tokens = await tokenResponse.json() as any;
      
      if (!tokens.access_token) {
        throw new Error('Failed to get access token');
      }

      // Get user info
      const userResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokens.access_token}`);
      const userInfo = await userResponse.json() as any;

      return {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture
      };
    } catch (error) {
      throw new Error('Google OAuth failed: ' + (error instanceof Error ? error.message : String(error)));
    }
  }
}

export const auth = new SimpleAuth(); 