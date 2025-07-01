import { betterAuth } from 'better-auth';
import { Pool } from 'pg';

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  secret: process.env.AUTH_SECRET || 'your-secret-key-here',
  baseURL: process.env.BASE_URL || 'http://localhost:3000',
  trustedOrigins: [process.env.FRONTEND_URL || 'http://localhost:5173' || 'https://weather-agent-henna.vercel.app '],
  
  // Enable Google OAuth 2.0
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Request calendar scope for weather-calendar integration
      scope: ['email', 'profile', 'https://www.googleapis.com/auth/calendar.readonly'],
    },
  },
  
  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session if older than 1 day
  },
  
  // Security features
  rateLimit: {
    enabled: true,
    window: 60, // 60 seconds
    max: 10, // max 10 requests per window
  },
  
  // Email configuration (for future use)
  emailAndPassword: {
    enabled: false, // Can enable later if needed
  },
}); 