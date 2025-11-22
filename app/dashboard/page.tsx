import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserProfile, createUserProfile } from '@/lib/auth/user-profile';
import { UserRole } from '@/types/roles';

export default async function UnifiedDashboard() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
    return null;
  }

  let userProfile = await getUserProfile(user.id);

  if (!userProfile) {
    try {
      userProfile = await createUserProfile({
        clerkId: user.id,
        email: user.emailAddresses?.[0]?.emailAddress || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: UserRole.CUSTOMER,
      });
    } catch (error) {
      console.error('Failed to create profile:', error);
      redirect('/dashboard/user');
      return null;
    }
  }

  // Route based on role
  if (userProfile.role === UserRole.ADMIN || userProfile.role === UserRole.SUPER_ADMIN) {
    redirect('/admin');
  } else {
    redirect('/orders');
  }
  return null;
}