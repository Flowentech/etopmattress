import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { writeClient, client } from '@/sanity/lib/client';
import { api } from '@/lib/api/response';
import { cache } from '@/lib/cache/service';
import { getUserProfile, updateUserProfile } from '@/lib/auth/user-profile';

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

    // Users can only access their own settings
    if (userIdParam !== userId) {
      return api.error('Forbidden', {
        code: 'FORBIDDEN',
        status: 403
      });
    }

    const cacheKey = cache.generateKey('user:settings', { userId });

    const fetchUserSettings = async () => {
      // client is already imported

      // Fetch user settings from Sanity
      const settings = await client.fetch(`
        *[_type == "userSettings" && userId == $userId][0] {
          preferences,
          profile,
          billing,
          _updatedAt
        }
      `, { userId });

      return { settings };
    };

    return api.withCache(cacheKey, fetchUserSettings, {
      cache: { ttl: 600, tags: [`user:${userId}:settings`] }, // 10 minutes cache
      enablePerformanceMonitoring: true
    });

  } catch (error) {
    console.error('Error fetching user settings:', error);
    return api.error('Failed to fetch settings', {
      code: 'INTERNAL_ERROR',
      status: 500
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return api.error('Unauthorized', {
        code: 'UNAUTHORIZED',
        status: 401
      });
    }

    const body = await request.json();
    const { userId: userIdParam, settings: userSettings } = body;

    // Users can only update their own settings
    if (userIdParam !== userId) {
      return api.error('Forbidden', {
        code: 'FORBIDDEN',
        status: 403
      });
    }

    // Validate settings structure
    if (!userSettings || typeof userSettings !== 'object') {
      return api.error('Invalid settings data', {
        code: 'VALIDATION_ERROR',
        status: 400
      });
    }

    // Update or create user settings in Sanity
    const existingSettings = await client.fetch(`
      *[_type == "userSettings" && userId == $userId][0]._id
    `, { userId });

    const settingsDoc = {
      _type: 'userSettings',
      userId,
      preferences: userSettings.preferences || {},
      profile: userSettings.profile || {},
      billing: userSettings.billing || { paymentMethods: [] },
      _updatedAt: new Date().toISOString(),
    };

    let result;
    if (existingSettings) {
      // Update existing settings
      result = await writeClient
        .patch(existingSettings)
        .set(settingsDoc)
        .commit();
    } else {
      // Create new settings
      result = await writeClient.create(settingsDoc);
    }

    // Update user profile if preferences changed
    if (userSettings.preferences) {
      try {
        const userProfile = await getUserProfile(userId);
        if (userProfile) {
          await updateUserProfile(userId, {
            preferences: userSettings.preferences
          });
        }
      } catch (profileError) {
        console.error('Failed to update user profile preferences:', profileError);
        // Continue anyway - settings were saved
      }
    }

    // Invalidate cache
    await cache.invalidatePattern(`user:${userId}:*`);

    return api.success({
      message: 'Settings updated successfully',
      settings: result
    }, {
      status: 200
    });

  } catch (error) {
    console.error('Error updating user settings:', error);
    return api.error('Failed to update settings', {
      code: 'INTERNAL_ERROR',
      status: 500
    });
  }
}