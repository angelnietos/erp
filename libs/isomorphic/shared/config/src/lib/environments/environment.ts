/**
 * Environment Configuration
 * Manages application environment variables and configuration
 */

/**
 * Supported environments
 */
export type Environment = 'development' | 'staging' | 'production' | 'test';

/**
 * Application configuration interface
 */
export interface AppConfig {
  appName: string;
  env: Environment;
  version: string;
  port: number;
  apiUrl: string;
  debug: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  corsEnabled: boolean;
  apiTimeout: number;
}

/**
 * Database configuration
 */
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  url?: string;
}

/**
 * JWT configuration
 */
export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

/**
 * Email configuration
 */
export interface EmailConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
  tls: boolean;
}

/**
 * Verifactu configuration (Spanish invoice system)
 */
export interface VerifactuConfig {
  environment: 'test' | 'production';
  nif: string;
  certPath: string;
  keyPath: string;
  autoSubmitThreshold: number;
}

/**
 * Full configuration object
 */
export interface Configuration {
  app: AppConfig;
  database: DatabaseConfig;
  jwt: JwtConfig;
  email: EmailConfig;
  verifactu: VerifactuConfig;
}

/**
 * Default development configuration
 */
export const DEFAULT_CONFIG: Configuration = {
  app: {
    appName: 'ERP Josanz',
    env: 'development',
    version: '1.0.0',
    port: 3000,
    apiUrl: 'http://localhost:3000',
    debug: true,
    logLevel: 'debug',
    corsEnabled: true,
    apiTimeout: 30000,
  },
  database: {
    host: 'localhost',
    port: 5432,
    database: 'josanz_erp',
    username: 'postgres',
    password: 'postgres',
    ssl: false,
  },
  jwt: {
    secret: 'dev-secret-change-in-production',
    expiresIn: '1d',
    refreshExpiresIn: '7d',
  },
  email: {
    host: 'localhost',
    port: 1025,
    user: '',
    password: '',
    from: 'noreply@josanz-erp.local',
    tls: false,
  },
  verifactu: {
    environment: 'test',
    nif: '',
    certPath: '',
    keyPath: '',
    autoSubmitThreshold: 1000,
  },
};

/**
 * Get configuration based on environment
 */
export function getConfig(): Configuration {
  const env = (process.env['NODE_ENV'] as Environment) || 'development';
  return mergeConfig(DEFAULT_CONFIG, getEnvOverrides());
}

/**
 * Get environment variable overrides
 */
function getEnvOverrides(): Partial<Configuration> {
  return {
    app: {
      appName: process.env['APP_NAME'] || DEFAULT_CONFIG.app.appName,
      env: (process.env['NODE_ENV'] as Environment) || 'development',
      version: process.env['APP_VERSION'] || DEFAULT_CONFIG.app.version,
      port: parseInt(process.env['PORT'] || '3000', 10),
      apiUrl: process.env['API_URL'] || DEFAULT_CONFIG.app.apiUrl,
      debug: process.env['DEBUG'] === 'true',
      logLevel: (process.env['LOG_LEVEL'] as Configuration['app']['logLevel']) || 'info',
      corsEnabled: process.env['CORS_ENABLED'] !== 'false',
      apiTimeout: parseInt(process.env['API_TIMEOUT'] || '30000', 10),
    },
    database: {
      host: process.env['DB_HOST'] || DEFAULT_CONFIG.database.host,
      port: parseInt(process.env['DB_PORT'] || '5432', 10),
      database: process.env['DB_NAME'] || DEFAULT_CONFIG.database.database,
      username: process.env['DB_USER'] || DEFAULT_CONFIG.database.username,
      password: process.env['DB_PASSWORD'] || DEFAULT_CONFIG.database.password,
      ssl: process.env['DB_SSL'] === 'true',
      url: process.env['DATABASE_URL'],
    },
    jwt: {
      secret: process.env['JWT_SECRET'] || DEFAULT_CONFIG.jwt.secret,
      expiresIn: process.env['JWT_EXPIRES_IN'] || DEFAULT_CONFIG.jwt.expiresIn,
      refreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] || DEFAULT_CONFIG.jwt.refreshExpiresIn,
    },
    email: {
      host: process.env['SMTP_HOST'] || DEFAULT_CONFIG.email.host,
      port: parseInt(process.env['SMTP_PORT'] || '1025', 10),
      user: process.env['SMTP_USER'] || DEFAULT_CONFIG.email.user,
      password: process.env['SMTP_PASSWORD'] || DEFAULT_CONFIG.email.password,
      from: process.env['EMAIL_FROM'] || DEFAULT_CONFIG.email.from,
      tls: process.env['SMTP_TLS'] === 'true',
    },
    verifactu: {
      environment: (process.env['VERIFACTU_ENV'] as 'test' | 'production') || 'test',
      nif: process.env['VERIFACTU_NIF'] || '',
      certPath: process.env['VERIFACTU_CERT_PATH'] || '',
      keyPath: process.env['VERIFACTU_KEY_PATH'] || '',
      autoSubmitThreshold: parseInt(process.env['VERIFACTU_THRESHOLD'] || '1000', 10),
    },
  };
}

/**
 * Deep merge configuration objects
 */
function mergeConfig(base: Configuration, overrides: Partial<Configuration>): Configuration {
  const result = {
    app: { ...base.app, ...(overrides.app || {}) },
    database: { ...base.database, ...(overrides.database || {}) },
    jwt: { ...base.jwt, ...(overrides.jwt || {}) },
    email: { ...base.email, ...(overrides.email || {}) },
    verifactu: { ...base.verifactu, ...(overrides.verifactu || {}) },
  };
  return result;
}

/**
 * Validate required configuration
 */
export function validateConfig(config: Configuration): string[] {
  const errors: string[] = [];

  if (!config.app.env) {
    errors.push('Application environment is required');
  }

  if (config.app.env === 'production') {
    if (!config.jwt.secret || config.jwt.secret === DEFAULT_CONFIG.jwt.secret) {
      errors.push('JWT secret must be changed in production');
    }

    if (!config.verifactu.nif) {
      errors.push('Verifactu NIF is required in production');
    }
  }

  if (config.database.ssl && !config.database.url) {
    if (!config.database.host || !config.database.username) {
      errors.push('Database SSL requires host and username');
    }
  }

  return errors;
}

/**
 * Create configuration with validation
 */
export function createConfiguration(): Configuration {
  const config = getConfig();
  const errors = validateConfig(config);

  if (errors.length > 0) {
    const isProduction = config.app.env === 'production';
    if (isProduction) {
      throw new Error(`Configuration errors: ${errors.join(', ')}`);
    }
    console.warn('Configuration warnings:', errors);
  }

  return config;
}
