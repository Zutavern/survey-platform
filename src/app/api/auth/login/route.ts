import { NextRequest, NextResponse } from 'next/server'

const ADMIN_CREDENTIALS = {
  email: 'admin@admin.com',
  password: 'admin123'
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Simple credential validation
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      // Create response with success
      const response = NextResponse.json({ 
        success: true, 
        message: 'Login successful',
        user: { email: ADMIN_CREDENTIALS.email, role: 'admin' }
      })

      // Set a simple session cookie
      response.cookies.set('auth-token', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })

      return response
    } else {
      return NextResponse.json(
        { success: false, message: 'Ungültige Anmeldedaten' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}