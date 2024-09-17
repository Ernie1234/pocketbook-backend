// src/@types/express.d.ts

declare global {
  namespace Express {
    interface Request {
      userId?: string; // Add userId property here
    }
  }
}
