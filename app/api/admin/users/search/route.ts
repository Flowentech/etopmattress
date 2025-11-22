import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { backendClient } from '@/sanity/lib/backendClient';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permissions
    const userProfile = await backendClient.fetch(`
      *[_type == "userProfile" && clerkId == $clerkId][0] {
        role
      }
    `, { clerkId: user.id });

    if (!userProfile || !['admin', 'super_admin'].includes(userProfile.role)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId parameter is required' }, { status: 400 });
    }

    // Search for user profile by clerkId
    const profile = await backendClient.fetch(`
      *[_type == "userProfile" && clerkId == $clerkId][0] {
        clerkId,
        email,
        firstName,
        lastName,
        role,
        isActive,
        isVerified,
        createdAt
      }
    `, { clerkId: userId });

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error searching user:', error);
    return NextResponse.json({ error: 'Failed to search user' }, { status: 500 });
  }
}