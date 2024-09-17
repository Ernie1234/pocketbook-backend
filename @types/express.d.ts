// express.d.ts
import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string; // Optional userId
  }
}
