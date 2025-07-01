import { Router } from 'express';
import { auth } from '../config/auth';
import { toNodeHandler } from 'better-auth/node';

const authRouter = Router();

// Handle all BetterAuth routes with wildcard pattern
// This catches all routes like /get-session, /sign-in-social, etc.
authRouter.all('*', toNodeHandler(auth));

export default authRouter; 