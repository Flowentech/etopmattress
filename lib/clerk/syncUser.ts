import { User } from '@clerk/nextjs/server';
import { backendClient } from '@/sanity/lib/backendClient';

/**
 * Sync Clerk user to Sanity database
 * Creates or updates user profile in Sanity
 */
export async function syncUserToSanity(user: User) {
  if (!user) {
    console.warn('syncUserToSanity: No user provided');
    return null;
  }

  try {
    const clerkId = user.id;
    const email = user.emailAddresses[0]?.emailAddress || '';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    const profilePicture = user.imageUrl || '';

    // Check if user already exists in Sanity
    const existingUser = await backendClient.fetch(
      `*[_type == "userProfile" && clerkId == $clerkId][0]`,
      { clerkId }
    );

    if (existingUser) {
      // Update existing user
      const updatedUser = await backendClient
        .patch(existingUser._id)
        .set({
          email,
          firstName,
          lastName,
          profilePicture,
          lastLoginAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .commit();

      console.log('User profile updated in Sanity:', updatedUser._id);
      return updatedUser;
    } else {
      // Create new user profile
      const newUser = await backendClient.create({
        _type: 'userProfile',
        clerkId,
        email,
        firstName,
        lastName,
        profilePicture,
        role: 'customer', // Default role
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      });

      console.log('User profile created in Sanity:', newUser._id);
      return newUser;
    }
  } catch (error) {
    console.error('Error syncing user to Sanity:', error);
    // Don't throw error - we don't want to break the user flow
    return null;
  }
}

/**
 * Get or create user profile in Sanity
 * Used as a fallback when webhook might not have fired
 */
export async function ensureUserProfile(clerkId: string) {
  try {
    const existingUser = await backendClient.fetch(
      `*[_type == "userProfile" && clerkId == $clerkId][0]`,
      { clerkId }
    );

    return existingUser;
  } catch (error) {
    console.error('Error checking user profile:', error);
    return null;
  }
}
