import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { api } from '@/lib/api/response';
import { cache } from '@/lib/cache/service';
import { getUserProfile } from '@/lib/auth/user-profile';

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return api.error('Unauthorized', {
        code: 'UNAUTHORIZED',
        status: 401
      });
    }

    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get('userId');

    // Users can only access their own profile
    if (userIdParam && userIdParam !== userId) {
      return api.error('Forbidden', {
        code: 'FORBIDDEN',
        status: 403
      });
    }

    const cacheKey = cache.generateKey('user:profile', { userId: userIdParam || userId });

    const fetchUserProfile = async () => {
      const userProfile = await getUserProfile(userIdParam || userId);
      return { profile: userProfile };
    };

    return api.withCache(cacheKey, fetchUserProfile, {
      cache: { ttl: 600, tags: [`user:${userIdParam || userId}:profile`] }, // 10 minutes cache
      enablePerformanceMonitoring: true
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return api.error('Failed to fetch user profile', {
      code: 'INTERNAL_ERROR',
      status: 500
    });
  }
}