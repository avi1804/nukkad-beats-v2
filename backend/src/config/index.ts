/**
 * Environment Configuration Module
 * 
 * This module loads and validates all environment variables required by the application.
 * It supports development, staging, and production profiles and exits with error if
 * required variables are missing.
 * 
 * Validates Requirements: 24.1, 24.2, 24.3, 24.4, 24.5
 */

import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Environment profile type
 */
export type Environment = 'development' | 'staging' | 'production' | 'test';

/**
 * Configuration interface defining all environment variables
 */
export interface Config {
  // Environment
  nodeEnv: Environment;
  port: number;
  host: string;

  // Database
  databaseUrl: string;

  // JWT
  jwtSecret: string;
  jwtAccessTokenExpiresIn: string;
  jwtRefreshTokenExpiresIn: string;

  // Razorpay
  razorpay: {
    keyId: string;
    keySecret: string;
  };

  // Cloudinary
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };

  // Email
  email: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
    fromName: string;
    fromAddress: string;
  };

  // WhatsApp (Optional)
  whatsapp: {
    enabled: boolean;
    apiUrl?: string;
    phoneNumberId?: string;
    accessToken?: string;
    businessPhone?: string;
  };

  // Twilio (Optional - Alternative to WhatsApp Cloud API)
  twilio: {
    enabled: boolean;
    accountSid?: string;
    authToken?: string;
    whatsappFrom?: string;
  };

  // CORS
  corsOrigin: string[];

  // Rate Limiting
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };

  // Logging
  logLevel: string;

  // File Upload
  upload: {
    maxFileSizeMB: number;
    allowedFileTypes: string[];
  };

  // Frontend
  frontendUrl: string;

  // Seed Data
  seed: {
    adminEmail: string;
    adminPassword: string;
    adminName: string;
    adminPhone: string;
  };
}

/**
 * Required environment variables that must be present
 */
const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USER',
  'EMAIL_PASSWORD',
] as const;

/**
 * Validates that all required environment variables are present
 * @throws {Error} If any required variable is missing
 */
function validateRequiredEnvVars(): void {
  const missingVars: string[] = [];

  for (const varName of REQUIRED_ENV_VARS) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    const errorMessage = `
╔════════════════════════════════════════════════════════════════╗
║  CONFIGURATION ERROR: Missing Required Environment Variables  ║
╚════════════════════════════════════════════════════════════════╝

The following required environment variables are not set:

${missingVars.map((v) => `  ❌ ${v}`).join('\n')}

Please ensure all required environment variables are set before starting the application.

To fix this:
1. Copy .env.example to .env
2. Fill in all required values in .env file
3. Restart the application

For more information, see .env.example file.
`;

    console.error(errorMessage);
    process.exit(1);
  }
}

/**
 * Gets an environment variable value with optional default
 * @param key - Environment variable key
 * @param defaultValue - Default value if not set
 * @returns The environment variable value or default
 */
function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (value === undefined && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is not set and has no default value`);
  }
  return value || defaultValue || '';
}

/**
 * Gets an environment variable as a number
 * @param key - Environment variable key
 * @param defaultValue - Default value if not set
 * @returns The parsed number value
 */
function getEnvVarAsNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    console.warn(`Warning: ${key} is not a valid number, using default: ${defaultValue}`);
    return defaultValue;
  }
  return parsed;
}

/**
 * Gets an environment variable as a boolean
 * @param key - Environment variable key
 * @param defaultValue - Default value if not set
 * @returns The boolean value
 */
function getEnvVarAsBoolean(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

/**
 * Gets an environment variable as an array (comma-separated)
 * @param key - Environment variable key
 * @param defaultValue - Default value if not set
 * @returns Array of string values
 */
function getEnvVarAsArray(key: string, defaultValue: string[]): string[] {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.split(',').map((v) => v.trim()).filter(Boolean);
}

/**
 * Validates the NODE_ENV value
 * @param env - Environment value
 * @returns Valid environment value
 */
function validateEnvironment(env: string | undefined): Environment {
  const validEnvs: Environment[] = ['development', 'staging', 'production', 'test'];
  const normalized = (env || 'development').toLowerCase() as Environment;

  if (!validEnvs.includes(normalized)) {
    console.warn(`Warning: Invalid NODE_ENV "${env}", defaulting to "development"`);
    return 'development';
  }

  return normalized;
}

/**
 * Loads and validates all configuration from environment variables
 * Exits process with code 1 if required variables are missing
 * 
 * @returns Complete configuration object
 */
function loadConfig(): Config {
  // First, validate that all required environment variables are present
  validateRequiredEnvVars();

  // Validate and normalize NODE_ENV
  const nodeEnv = validateEnvironment(process.env.NODE_ENV);

  // Build configuration object
  const config: Config = {
    // Environment
    nodeEnv,
    port: getEnvVarAsNumber('PORT', 5000),
    host: getEnvVar('HOST', 'localhost'),

    // Database (Required)
    databaseUrl: getEnvVar('DATABASE_URL'),

    // JWT (Required)
    jwtSecret: getEnvVar('JWT_SECRET'),
    jwtAccessTokenExpiresIn: getEnvVar('JWT_ACCESS_TOKEN_EXPIRES_IN', '15m'),
    jwtRefreshTokenExpiresIn: getEnvVar('JWT_REFRESH_TOKEN_EXPIRES_IN', '7d'),

    // Razorpay (Required)
    razorpay: {
      keyId: getEnvVar('RAZORPAY_KEY_ID'),
      keySecret: getEnvVar('RAZORPAY_KEY_SECRET'),
    },

    // Cloudinary (Required)
    cloudinary: {
      cloudName: getEnvVar('CLOUDINARY_CLOUD_NAME'),
      apiKey: getEnvVar('CLOUDINARY_API_KEY'),
      apiSecret: getEnvVar('CLOUDINARY_API_SECRET'),
    },

    // Email (Required)
    email: {
      host: getEnvVar('EMAIL_HOST'),
      port: getEnvVarAsNumber('EMAIL_PORT', 587),
      secure: getEnvVarAsBoolean('EMAIL_SECURE', false),
      user: getEnvVar('EMAIL_USER'),
      password: getEnvVar('EMAIL_PASSWORD'),
      fromName: getEnvVar('EMAIL_FROM_NAME', 'NUKKAD BEATS'),
      fromAddress: getEnvVar('EMAIL_FROM_ADDRESS', 'nukkadbeatsofficial@gmail.com'),
    },

    // WhatsApp (Optional)
    whatsapp: {
      enabled: getEnvVarAsBoolean('WHATSAPP_ENABLED', false),
      apiUrl: process.env.WHATSAPP_API_URL,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
      businessPhone: process.env.WHATSAPP_BUSINESS_PHONE,
    },

    // Twilio (Optional)
    twilio: {
      enabled: getEnvVarAsBoolean('TWILIO_ENABLED', false),
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      whatsappFrom: process.env.TWILIO_WHATSAPP_FROM,
    },

    // CORS
    corsOrigin: getEnvVarAsArray('CORS_ORIGIN', ['http://localhost:3000']),

    // Rate Limiting
    rateLimit: {
      windowMs: getEnvVarAsNumber('RATE_LIMIT_WINDOW_MS', 900000), // 15 minutes
      maxRequests: getEnvVarAsNumber('RATE_LIMIT_MAX_REQUESTS', 100),
    },

    // Logging
    logLevel: getEnvVar('LOG_LEVEL', 'info'),

    // File Upload
    upload: {
      maxFileSizeMB: getEnvVarAsNumber('MAX_FILE_SIZE_MB', 5),
      allowedFileTypes: getEnvVarAsArray('ALLOWED_FILE_TYPES', [
        'image/jpeg',
        'image/png',
        'image/webp',
      ]),
    },

    // Frontend
    frontendUrl: getEnvVar('FRONTEND_URL', 'http://localhost:3000'),

    // Seed Data
    seed: {
      adminEmail: getEnvVar('SEED_ADMIN_EMAIL', 'nukkadbeatsofficial@gmail.com'),
      adminPassword: getEnvVar('SEED_ADMIN_PASSWORD', 'Admin@123456'),
      adminName: getEnvVar('SEED_ADMIN_NAME', 'Admin User'),
      adminPhone: getEnvVar('SEED_ADMIN_PHONE', '9876543210'),
    },
  };

  // Log configuration loading success (without sensitive data)
  if (nodeEnv === 'development') {
    console.log('✅ Configuration loaded successfully');
    console.log(`📦 Environment: ${nodeEnv}`);
    console.log(`🚀 Server will run on: ${config.host}:${config.port}`);
    console.log(`🗄️  Database: ${config.databaseUrl.split('@')[1] || 'configured'}`);
  }

  return config;
}

/**
 * Check if running in production
 */
export const isProduction = (): boolean => config.nodeEnv === 'production';

/**
 * Check if running in development
 */
export const isDevelopment = (): boolean => config.nodeEnv === 'development';

/**
 * Check if running in staging
 */
export const isStaging = (): boolean => config.nodeEnv === 'staging';

/**
 * Check if running in test
 */
export const isTest = (): boolean => config.nodeEnv === 'test';

// Load and export configuration
export const config = loadConfig();

// Export default
export default config;
