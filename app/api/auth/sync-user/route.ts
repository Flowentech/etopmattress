import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { syncUserToSanity } from '@/lib/clerk/syncUser';

export async function POST() {
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
      success: !!sanityUser,
      message: sanityUser ? 'User synced successfully' : 'User sync failed',
      userId: sanityUser?._id,
    });
  } catch (error) {
    console.error('Error in sync-user endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to sync user' },
      { status: 500 }
    );
  }
}

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
