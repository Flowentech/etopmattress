import { client } from '@/sanity/lib/client';
import { writeClient } from '@/sanity/lib/client';
import { UserRole, UserProfile } from '@/types/roles';

export async function getUserProfile(clerkId: string): Promise<UserProfile | null> {
  try {
    const profile = await client.fetch(`
      *[_type == "userProfile" && clerkId == $clerkId][0] {
        _id,
        clerkId,
        email,
        firstName,
        lastName,
        role,
        storeId,
        architectureFirmId,
        isActive,
        isVerified,
        createdAt,
        updatedAt
      }
    `, { clerkId });

    return profile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function createUserProfile(data: {
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  storeId?: string;
  architectureFirmId?: string;
}): Promise<UserProfile> {
  try {
    const profile = {
      _type: 'userProfile',
      clerkId: data.clerkId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      storeId: data.storeId,
      architectureFirmId: data.architectureFirmId,
      isActive: data.role === UserRole.CUSTOMER, // Customers are active immediately
      isVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await writeClient.create(profile);
    return result as UserProfile;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

export async function updateUserProfile(clerkId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  try {
    const result = await writeClient
      .patch(clerkId, updates)
      .commit();

    return result as UserProfile;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

export async function activateUserProfile(clerkId: string): Promise<UserProfile> {
  return updateUserProfile(clerkId, {
    isActive: true,
    isVerified: true,
    updatedAt: new Date().toISOString(),
  });
}

export async function deactivateUserProfile(clerkId: string): Promise<UserProfile> {
  return updateUserProfile(clerkId, {
    isActive: false,
    updatedAt: new Date().toISOString(),
  });
}