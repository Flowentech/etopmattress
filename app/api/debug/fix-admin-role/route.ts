import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { client } from '@/sanity/lib/client';

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
    }

    // Check if user profile exists
    const existingProfile = await client.fetch(`
      *[_type == "userProfile" && clerkId == $clerkId][0] {
        _id,
        role
      }
    `, { clerkId: user.id });

    if (existingProfile) {
      // Update existing profile to admin
      const updatedProfile = await client
        .patch(existingProfile._id)
        .set({
          role: 'admin',
          status: 'active',
          updatedAt: new Date().toISOString()
        })
        .commit();

      return NextResponse.json({
        success: true,
        message: 'User role updated to admin',
        profile: updatedProfile
      });
    } else {
      // Create new admin profile
      const newProfile = await client.create({
        _type: 'userProfile',
        clerkId: user.id,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.emailAddresses?.[0]?.emailAddress || '',
        role: 'admin',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      return NextResponse.json({
        success: true,
        message: 'Admin profile created',
        profile: newProfile
      });
    }

  } catch (error) {
    console.error('Fix admin role error:', error);
    return NextResponse.json({ error: 'Failed to update admin role' }, { status: 500 });
  }
}