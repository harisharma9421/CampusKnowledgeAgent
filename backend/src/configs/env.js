/**
 * Environment Configuration
 * Centralizes all environment variable access with defaults and validation.
 * Import this module instead of accessing process.env directly.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const env = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  HOST: process.env.HOST || 'localhost',

  // CORS
  CORS_ORIGINS: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
    : ['http://localhost:5173', 'http://localhost:3000'],

  // API
  API_VERSION: process.env.API_VERSION || 'v1',

  // AI Engine
  AI_ENGINE_URL: process.env.AI_ENGINE_URL || 'http://localhost:8000',
  AI_ENGINE_TIMEOUT: parseInt(process.env.AI_ENGINE_TIMEOUT, 10) || 30000,

  // Firebase
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || '',
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : '',
  FIREBASE_USE_EMULATOR: process.env.FIREBASE_USE_EMULATOR === 'true',
  FIRESTORE_EMULATOR_HOST: process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  LOG_DIR: process.env.LOG_DIR || 'logs',

  // Derived helpers
  isDevelopment() {
    return this.NODE_ENV === 'development';
  },
  isProduction() {
    return this.NODE_ENV === 'production';
  },
  isTest() {
    return this.NODE_ENV === 'test';
  },
};

export default env;
