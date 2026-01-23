import { requireAuth } from '@clerk/express';

// Use this middleware to protect routes
export const authenticateJWT = requireAuth();
