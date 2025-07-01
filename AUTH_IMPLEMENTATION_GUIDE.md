# Authentication Implementation Guide

## Overview

This guide explains how to implement Google authentication using BetterAuth in your hexagonal architecture weather agent API with a React frontend.

## Why BetterAuth?

After analyzing the options:
- **BetterAuth** provides the best developer experience with TypeScript-first approach
- Built-in security features (rate limiting, CSRF protection)
- Much simpler than Auth.js/NextAuth
- Works with any framework (not tied to Next.js)
- Plugin architecture for future extensions

## Architecture Overview

```
Backend (Hexagonal Architecture):
├── core/                    # Domain logic
│   ├── entities/           # User, AuthSession
│   ├── ports/              # IAuthPort, IUserPort
│   └── usecases/           # AuthenticateUserUseCase
├── adapters/
│   ├── auth/               # BetterAuthAdapter
│   └── calendar/           # GoogleCalendarAdapter (future)
└── infrastructure/
    └── config/             # Auth configuration

Frontend (React + Vite):
├── components/
│   └── auth/               # Login, Profile components
├── hooks/                  # useAuth hook
└── pages/                  # Protected routes
```

## Backend Implementation

### 1. Environment Variables

Add to your `.env` file:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/weather_agent

# Auth
AUTH_SECRET=your-secret-key-here
BASE_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Frontend
FRONTEND_URL=http://localhost:5173
```

### 2. Database Schema

BetterAuth will auto-generate tables, but here's what it creates:
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  picture TEXT,
  google_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Accounts table (for OAuth providers)
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  provider_account_id VARCHAR(255) NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(provider, provider_account_id)
);
```

### 3. Create Use Cases

Create `src/core/usecases/AuthenticateUserUseCase.ts`:
```typescript
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
```

### 4. Create User Repository

Create `src/adapters/repositories/UserRepository.ts`:
```typescript
import { IUserPort } from '../../core/ports/IUserPort';
import { User, UserCreateData, UserUpdateData } from '../../core/entities/User';
import { Pool } from 'pg';

export class UserRepository implements IUserPort {
  constructor(private db: Pool) {}

  async createUser(data: UserCreateData): Promise<User> {
    const query = `
      INSERT INTO users (email, name, picture, google_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await this.db.query(query, [
      data.email,
      data.name,
      data.picture,
      data.googleId,
    ]);
    return this.mapToUser(result.rows[0]);
  }

  async findUserById(id: string): Promise<User | null> {
    const result = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] ? this.mapToUser(result.rows[0]) : null;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const result = await this.db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] ? this.mapToUser(result.rows[0]) : null;
  }

  async findUserByGoogleId(googleId: string): Promise<User | null> {
    const result = await this.db.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
    return result.rows[0] ? this.mapToUser(result.rows[0]) : null;
  }

  async updateUser(id: string, data: UserUpdateData): Promise<User> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    if (data.picture !== undefined) {
      fields.push(`picture = $${paramCount++}`);
      values.push(data.picture);
    }
    if (data.googleId !== undefined) {
      fields.push(`google_id = $${paramCount++}`);
      values.push(data.googleId);
    }

    values.push(id);
    const query = `
      UPDATE users 
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await this.db.query(query, values);
    return this.mapToUser(result.rows[0]);
  }

  async deleteUser(id: string): Promise<void> {
    await this.db.query('DELETE FROM users WHERE id = $1', [id]);
  }

  private mapToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      picture: row.picture,
      googleId: row.google_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
```

## Frontend Implementation

### 1. Create Frontend Structure

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install @better-auth/client @better-auth/react react-router-dom
```

### 2. Auth Client Configuration

Create `frontend/src/lib/auth-client.ts`:
```typescript
import { createAuthClient } from '@better-auth/client';

export const authClient = createAuthClient({
  baseURL: 'http://localhost:3000/api/auth',
});

export const { 
  signIn, 
  signOut, 
  useSession 
} = authClient;
```

### 3. Auth Provider

Create `frontend/src/providers/AuthProvider.tsx`:
```typescript
import React from 'react';
import { authClient } from '../lib/auth-client';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

### 4. Login Component

Create `frontend/src/components/auth/LoginButton.tsx`:
```typescript
import { authClient } from '../../lib/auth-client';

export function LoginButton() {
  const handleGoogleLogin = async () => {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/dashboard',
    });
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        {/* Google icon SVG */}
      </svg>
      Sign in with Google
    </button>
  );
}
```

### 5. Protected Routes

Create `frontend/src/components/ProtectedRoute.tsx`:
```typescript
import { Navigate } from 'react-router-dom';
import { useSession } from '../../lib/auth-client';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}
```

### 6. User Profile Component

Create `frontend/src/components/auth/UserProfile.tsx`:
```typescript
import { useSession, signOut } from '../../lib/auth-client';

export function UserProfile() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <div className="flex items-center gap-4">
      <img
        src={session.user.picture || '/default-avatar.png'}
        alt={session.user.name}
        className="w-10 h-10 rounded-full"
      />
      <div>
        <p className="font-medium">{session.user.name}</p>
        <p className="text-sm text-gray-600">{session.user.email}</p>
      </div>
      <button
        onClick={() => signOut()}
        className="text-sm text-red-600 hover:text-red-700"
      >
        Sign out
      </button>
    </div>
  );
}
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: 
     - `http://localhost:3000/api/auth/callback/google`
     - `http://localhost:5173` (for development)
5. Copy Client ID and Client Secret to `.env`

## Calendar Integration (Future)

When ready to add Google Calendar:

1. Update Google OAuth scope in `src/config/auth.ts`:
```typescript
scope: [
  'email',
  'profile',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events'
],
```

2. Create Calendar Adapter:
```typescript
// src/adapters/calendar/GoogleCalendarAdapter.ts
import { google } from 'googleapis';
import { ICalendarPort } from '../../core/ports/ICalendarPort';

export class GoogleCalendarAdapter implements ICalendarPort {
  private calendar;

  constructor(accessToken: string) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    this.calendar = google.calendar({ version: 'v3', auth });
  }

  async getUpcomingEvents(timeframe: string, maxEvents?: number) {
    const response = await this.calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: maxEvents || 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items || [];
  }

  // Implement other methods...
}
```

## Running the Application

1. **Backend**:
```bash
# Install dependencies
npm install

# Run migrations (if using a migration tool)
npm run migrate

# Start the server
npm run dev
```

2. **Frontend**:
```bash
cd frontend
npm install
npm run dev
```

3. Access:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Auth endpoints: http://localhost:3000/api/auth/*

## Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **CORS**: Configure allowed origins properly
3. **HTTPS**: Use HTTPS in production
4. **Session Management**: BetterAuth handles this, but monitor session expiry
5. **Rate Limiting**: Already configured in BetterAuth
6. **Database Security**: Use parameterized queries (already implemented)

## Testing

1. **Unit Tests**: Test use cases and adapters separately
2. **Integration Tests**: Test auth flow end-to-end
3. **Security Tests**: Test rate limiting, CSRF protection

## Deployment Considerations

1. **Database**: Use managed PostgreSQL (Supabase, Neon, etc.)
2. **Environment**: Set production environment variables
3. **HTTPS**: Configure SSL certificates
4. **Monitoring**: Add logging and monitoring
5. **Backup**: Regular database backups

## Troubleshooting

Common issues:
1. **CORS errors**: Check CORS configuration in Express
2. **OAuth redirect issues**: Verify redirect URIs in Google Console
3. **Database connection**: Check DATABASE_URL format
4. **Session issues**: Ensure cookies are enabled and secure

## Next Steps

1. Implement the frontend components
2. Add user profile management
3. Implement calendar integration
4. Add role-based access control (if needed)
5. Set up monitoring and analytics 