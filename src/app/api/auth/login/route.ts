import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, signSession, setSessionCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Look up user in DB
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: true, passwordHash: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Ungültige Anmeldedaten' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash)
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Ungültige Anmeldedaten' },
        { status: 401 }
      )
    }

    // Sign JWT session
    const token = await signSession({
      sub: user.id,
      email: user.email,
      role: user.role as 'ADMIN' | 'USER'
    })

    // Prepare successful response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: { email: user.email, role: user.role }
    })

    // Set JWT cookie
    setSessionCookie(response, token)

    // Clear legacy cookie if present
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}