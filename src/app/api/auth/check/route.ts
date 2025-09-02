import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Validate JWT session cookie ("session") or legacy fallback via helper
    const user = await getCurrentUser()

    if (user) {
      return NextResponse.json({
        authenticated: true,
        user: { email: user.email, role: user.role }
      })
    }

    return NextResponse.json(
      { authenticated: false, message: 'Not authenticated' },
      { status: 401 }
    )
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { authenticated: false, message: 'Server error' },
      { status: 500 }
    );
  }
}