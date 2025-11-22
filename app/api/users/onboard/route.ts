import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { api } from '@/lib/api/response';
import { createUserProfile } from '@/lib/auth/user-profile';
import { UserRole } from '@/types/roles';

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return api.error('Unauthorized', {
        code: 'UNAUTHORIZED',
        status: 401
      });
    }

    const body = await request.json();
    const { preferences } = body;

    // Check if user already has a profile
    const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/users/profile?userId=${userId}`);
    if (profileResponse.ok) {
      const data = await profileResponse.json();
      if (data.profile) {
        return api.success({
          message: 'User profile already exists',
          profile: data.profile
        });
      }
    }

    // Get user details from Clerk
    let email = '';
    let firstName = '';
    let lastName = '';

    try {
      const clerkResponse = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (clerkResponse.ok) {
        const clerkUser = await clerkResponse.json();
        email = clerkUser.email_addresses?.find((email: any) => email.id === clerkUser.primary_email_address_id)?.email_address ||
                 clerkUser.email_addresses?.[0]?.email_address || '';
        firstName = clerkUser.first_name || '';
        lastName = clerkUser.last_name || '';
      }
    } catch (clerkError) {
      console.error('Error fetching user from Clerk:', clerkError);
      // Continue with empty values if Clerk fetch fails
    }

    // Create user profile with actual user details
    const userProfile = await createUserProfile({
      clerkId: userId,
      email,
      firstName,
      lastName,
      role: UserRole.CUSTOMER,
    });

    return api.success({
      message: 'User profile created successfully',
      profile: userProfile
    }, {
      status: 201
    });

  } catch (error) {
    console.error('Error creating user profile:', error);
    return api.error('Failed to create user profile', {
      code: 'INTERNAL_ERROR',
      status: 500
    });
  }
}