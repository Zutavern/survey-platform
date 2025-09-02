import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

/**
 * Session payload structure for JWT
 */
export type SessionPayload = { 
  sub: string; 
  email: string; 
  role: 'ADMIN' | 'USER';
  iat?: number;
  exp?: number;
}

/**
 * Get the JWT secret from environment variables
 * @returns The JWT secret as a Uint8Array
 * @throws Error if JWT_SECRET is not set
 */
export function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || process.env.ENCRYPTION_KEY
  
  if (!secret) {
    throw new Error('JWT_SECRET or ENCRYPTION_KEY environment variable is required')
  }
  
  return new TextEncoder().encode(secret)
}

/**
 * Sign a JWT session token
 * @param payload - The session payload to encode
 * @returns The signed JWT token string
 */
export async function signSession(payload: SessionPayload): Promise<string> {
  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + 60 * 60 * 24 * 7 // 7 days
  
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .setNotBefore(iat)
    .sign(getJwtSecret())
}

/**
 * Verify and decode a JWT session token
 * @param token - The JWT token to verify
 * @returns The decoded session payload
 * @throws Error if the token is invalid or expired
 */
export async function verifySession(token: string): Promise<SessionPayload> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      algorithms: ['HS256'],
    })
    
    return payload as SessionPayload
  } catch (error) {
    throw new Error('Invalid or expired session token')
  }
}

/**
 * Set a session cookie in the response
 * @param response - The NextResponse object
 * @param token - The JWT token to set in the cookie
 * @returns The modified response
 */
export function setSessionCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
  
  return response
}

/**
 * Clear the session cookie
 * @param response - The NextResponse object
 * @returns The modified response
 */
export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  
  return response
}

/**
 * Hash a password using bcrypt
 * @param plainPassword - The plain text password to hash
 * @returns The hashed password
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, 12)
}

/**
 * Verify a password against its hash
 * @param plainPassword - The plain text password to verify
 * @param hashedPassword - The hashed password to compare against
 * @returns True if the password matches, false otherwise
 */
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword)
}

/**
 * Get the current user from the session cookie
 * @returns The session payload or null if no valid session exists
 */
export async function getCurrentUser(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies()
    
    // Try new session cookie first
    const sessionCookie = cookieStore.get('session')
    if (sessionCookie?.value) {
      return await verifySession(sessionCookie.value)
    }
    
    // Fallback to legacy auth-token for backward compatibility
    const legacyCookie = cookieStore.get('auth-token')
    if (legacyCookie?.value === 'authenticated') {
      // Return hardcoded admin for backward compatibility
      return {
        sub: 'legacy-admin',
        email: 'admin@admin.com',
        role: 'ADMIN'
      }
    }
    
    return null
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}
