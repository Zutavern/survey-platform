import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Check for the auth cookie
    const authToken = request.cookies.get('auth-token');

    if (authToken && authToken.value === 'authenticated') {
      return NextResponse.json({ 
        authenticated: true, 
        user: { email: 'admin@admin.com', role: 'admin' }
      });
    } else {
      return NextResponse.json(
        { authenticated: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { authenticated: false, message: 'Server error' },
      { status: 500 }
    );
  }
}