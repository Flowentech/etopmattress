import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { client } from '@/sanity/lib/client';

export async function GET() {
  try {
    const user = await currentUser();

    const diagnostics = {
      timestamp: new Date().toISOString(),
      clerkUser: user ? {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName
      } : null,
      sanityConfig: {
        projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
        dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
        hasWriteToken: !!process.env.SANITY_WRITE_TOKEN,
        hasReadToken: !!process.env.SANITY_API_READ_TOKEN,
      },
      tests: {}
    };

    // Test 1: Fetch userProfile if user is logged in
    if (user) {
      try {
        const userProfile = await client.fetch(`
          *[_type == "userProfile" && clerkId == $clerkId][0] {
            _id,
            email,
            firstName,
            lastName,
            role,
            isActive,
            isVerified
          }
        `, { clerkId: user.id });

        diagnostics.tests['userProfile'] = {
          success: true,
          found: !!userProfile,
          data: userProfile || null
        };
      } catch (error) {
        diagnostics.tests['userProfile'] = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    // Test 2: Count stores
    try {
      const storeCount = await client.fetch(`count(*[_type == "store"])`);
      diagnostics.tests['storeCount'] = {
        success: true,
        count: storeCount
      };
    } catch (error) {
      diagnostics.tests['storeCount'] = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Test 3: Fetch first store
    try {
      const firstStore = await client.fetch(`*[_type == "store"][0]{_id, name, slug}`);
      diagnostics.tests['firstStore'] = {
        success: true,
        found: !!firstStore,
        data: firstStore || null
      };
    } catch (error) {
      diagnostics.tests['firstStore'] = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Test 4: Count store applications
    try {
      const appCount = await client.fetch(`count(*[_type == "storeApplication"])`);
      diagnostics.tests['storeApplicationCount'] = {
        success: true,
        count: appCount
      };
    } catch (error) {
      diagnostics.tests['storeApplicationCount'] = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Test 5: Count user profiles
    try {
      const userCount = await client.fetch(`count(*[_type == "userProfile"])`);
      diagnostics.tests['userProfileCount'] = {
        success: true,
        count: userCount
      };
    } catch (error) {
      diagnostics.tests['userProfileCount'] = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    return NextResponse.json(diagnostics, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to run diagnostics',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
