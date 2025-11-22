import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { client } from '@/sanity/lib/client';

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
    }

    // Check user profile in Sanity
    const userProfile = await client.fetch(`
      *[_type == "userProfile" && clerkId == $clerkId][0] {
        _id,
        clerkId,
        firstName,
        lastName,
        email,
        role,
        status,
        createdAt
      }
    `, { clerkId: user.id });

    return NextResponse.json({
      clerkUser: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.emailAddresses?.[0]?.emailAddress
      },
      userProfile,
      isAdmin: userProfile ? ['admin', 'super_admin'].includes(userProfile.role) : false
    });

  } catch (error) {
    console.error('Debug user role error:', error);
    return NextResponse.json({ error: 'Failed to fetch user role' }, { status: 500 });
  }
}