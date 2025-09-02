import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

/**
 * Type representing encrypted data with all components needed for decryption
 */
export type Encrypted = {
  cipher: string; // Base64 encoded encrypted data
  iv: string;     // Base64 encoded initialization vector
  tag: string;    // Base64 encoded authentication tag
};

/**
 * Get the encryption key from environment variables
 * @returns Buffer containing the 32-byte key
 * @throws Error if the key is missing or invalid
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is required for encryption operations');
  }
  
  try {
    // Try to decode as base64
    const buffer = Buffer.from(key, 'base64');
    
    // Ensure key is exactly 32 bytes (256 bits)
    if (buffer.length !== 32) {
      throw new Error(`Encryption key must be 32 bytes (found ${buffer.length})`);
    }
    
    return buffer;
  } catch (error) {
    throw new Error('Invalid ENCRYPTION_KEY format. Must be a valid base64 string representing 32 bytes');
  }
}

/**
 * Encrypt a string using AES-256-GCM
 * @param plain - The plaintext string to encrypt
 * @returns Encrypted object with cipher, iv, and tag (all base64 encoded)
 */
export function encrypt(plain: string): Encrypted {
  // Generate a random 12-byte IV
  const iv = randomBytes(12);
  
  // Get the encryption key
  const key = getEncryptionKey();
  
  // Create cipher
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  
  // Encrypt the data
  let encrypted = cipher.update(plain, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  // Get the auth tag
  const tag = cipher.getAuthTag();
  
  // Return the encrypted components
  return {
    cipher: encrypted,
    iv: iv.toString('base64'),
    tag: tag.toString('base64')
  };
}

/**
 * Decrypt an encrypted payload
 * @param enc - The encrypted payload with cipher, iv, and tag
 * @returns The original plaintext string
 * @throws Error if decryption fails (e.g., tampered data)
 */
export function decrypt(enc: Encrypted): string {
  try {
    // Get the encryption key
    const key = getEncryptionKey();
    
    // Convert base64 components back to buffers
    const iv = Buffer.from(enc.iv, 'base64');
    const tag = Buffer.from(enc.tag, 'base64');
    
    // Create decipher
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    
    // Set auth tag for verification
    decipher.setAuthTag(tag);
    
    // Decrypt the data
    let decrypted = decipher.update(enc.cipher, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
    throw new Error('Decryption failed with unknown error');
  }
}
