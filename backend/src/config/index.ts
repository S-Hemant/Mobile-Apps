import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'pulsetrack-super-secret-jwt-key-aurora-2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  dataPath: process.env.DATA_PATH || path.resolve(process.cwd(), 'data', 'database.json'),
};
