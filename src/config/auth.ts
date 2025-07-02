import { betterAuth } from 'better-auth';

export const auth = betterAuth({
  database: {
    provider: 'pg',
    url: process.env.DATABASE_URL,
  },
  secret: process.env.AUTH_SECRET || process.env.BETTER_AUTH_SECRET || 'your-secret-key-here',
  baseURL: process.env.BASE_URL || process.env.BETTER_AUTH_URL || 'https://weather-agent-backend.vercel.app',
  trustedOrigins: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'https://weather-agent-henna.vercel.app'
  ],
  
  // Enable Google OAuth only if credentials are available
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && {
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        scope: ['email', 'profile'],
      },
    },
  }),
  
  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session if older than 1 day
  },
  
  // Disable features that might cause issues in serverless
  rateLimit: {
    enabled: false, // Disable for serverless
  },
  
  // Disable email for now
  emailAndPassword: {
    enabled: false,
  },
}); 