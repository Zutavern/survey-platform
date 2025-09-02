import { z } from 'zod';

/**
 * Environment variable schema using Zod
 */
const EnvSchema = z.object({
  // API Keys
  TALLY_API_KEY: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  
  // Encryption
  ENCRYPTION_KEY: z.string().min(1).optional(),
  
  // Database
  DATABASE_URL: z.string().min(1).optional(),
  
  // Node environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

/**
 * Parsed and typed environment variables
 */
export const env = EnvSchema.parse(process.env);

/**
 * Type for environment variable keys
 */
type EnvKey = keyof typeof env;

/**
 * Assert that a required environment variable is present
 * @param key - The environment variable key
 * @param errorMessage - Optional custom error message
 * @throws Error if the environment variable is missing or empty
 */
export function assertEnvVar(key: EnvKey, errorMessage?: string): void {
  if (!env[key]) {
    throw new Error(
      errorMessage || 
      `Missing required environment variable: ${key}`
    );
  }
}

/**
 * Assert multiple environment variables at once
 * @param keys - Array of environment variable keys
 * @throws Error if any of the environment variables are missing or empty
 */
export function assertEnvVars(keys: EnvKey[]): void {
  const missing = keys.filter(key => !env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}
