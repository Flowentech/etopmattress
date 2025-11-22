import { auth, clerkClient } from "@clerk/nextjs/server";

/**
 * Safely get the current user from Clerk
 * Returns null if user is not authenticated or if there's an error
 */
export async function getCurrentUser() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return null;
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    return user;
  } catch (error: any) {
    console.error('[Clerk Error] Failed to fetch current user');
    console.error('Error details:', {
      message: error?.message,
      status: error?.status,
      clerkError: error?.clerkError,
      errors: error?.errors,
      clerkTraceId: error?.clerkTraceId,
    });

    // Log full error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Full error:', error);
    }

    return null;
  }
}

/**
 * Get current user ID
 * Returns null if not authenticated
 */
export async function getCurrentUserId() {
  try {
    const { userId } = await auth();
    return userId ?? null;
  } catch (error) {
    console.error('Error fetching user ID:', error);
    return null;
  }
}

/**
 * Get safe user object for client components
 */
export async function getSafeUser() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    fullName: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
    email: user.emailAddresses?.[0]?.emailAddress ?? null,
    imageUrl: user.imageUrl ?? null,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}
