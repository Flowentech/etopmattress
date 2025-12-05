import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { syncUserToSanity } from '@/lib/clerk/syncUser';

/**
 * API endpoint to sync current user to Sanity
 * Called after successful sign-in/sign-up
 */
export async function POST() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Sync user to Sanity
    const sanityUser = await syncUserToSanity(user);

    if (sanityUser) {
      return NextResponse.json({
        success: true,
        message: 'User synced successfully',
        userId: sanityUser._id,
      });
    } else {
      // User sync failed, but don't break the flow
      console.warn('User sync failed for:', user.id);
      return NextResponse.json({
        success: false,
        message: 'User sync failed, but authentication successful',
      });
    }
  } catch (error) {
    console.error('Error in sync-user endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to sync user' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check if user exists in Sanity
 */
export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const sanityUser = await syncUserToSanity(user);

    return NextResponse.json({
      exists: !!sanityUser,
      user: sanityUser,
    });
  } catch (error) {
    console.error('Error checking user:', error);
    return NextResponse.json(
      { error: 'Failed to check user' },
      { status: 500 }
    );
  }
}
