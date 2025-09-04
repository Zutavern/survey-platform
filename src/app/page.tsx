'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    console.log('🏠 HomePage mounted, checking authentication...');
    
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        console.log('🔐 Making auth check request to /api/auth/check');
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include',
        });

        console.log('📡 Auth check response:', {
          status: response.status,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries())
        });

        if (response.ok) {
          console.log('✅ User is authenticated, redirecting to dashboard');
          router.push('/dashboard');
        } else {
          console.log('❌ User not authenticated, redirecting to login');
          router.push('/login');
        }
      } catch (error) {
        console.error('🚨 Auth check error:', error);
        console.log('⚠️ Falling back to login page');
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  // Show a simple loading state while checking authentication
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-blue-600 font-medium">Wird geladen...</p>
      </div>
    </div>
  );
}