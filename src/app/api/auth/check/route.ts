import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  console.log('🔍 Auth check API called');
  console.log('📝 Request headers:', Object.fromEntries(request.headers.entries()));
  console.log('🍪 Request cookies:', request.cookies.getAll());
  
  try {
    console.log('👤 Getting current user...');
    // Validate JWT session cookie ("session") or legacy fallback via helper
    const user = await getCurrentUser()
    console.log('🔐 getCurrentUser result:', user ? { email: user.email, role: user.role } : 'No user found');

    if (user) {
      console.log('✅ User authenticated, returning success');
      return NextResponse.json({
        authenticated: true,
        user: { email: user.email, role: user.role }
      })
    }

    console.log('❌ User not authenticated, returning 401');
    return NextResponse.json(
      { authenticated: false, message: 'Not authenticated' },
      { status: 401 }
    )
  } catch (error) {
    console.error('🚨 Auth check error:', error);
    return NextResponse.json(
      { authenticated: false, message: 'Server error' },
      { status: 500 }
    );
  }
}