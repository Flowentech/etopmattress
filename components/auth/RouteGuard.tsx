'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { UserRole, UserProfile } from '@/types/roles';
import { getUserProfile } from '@/lib/auth/user-profile';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

export function RouteGuard({ children, allowedRoles, fallback }: RouteGuardProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserProfile() {
      if (!isLoaded || !user) {
        setLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile(user.id);
        setUserProfile(profile);

        // Check if user has allowed role
        if (profile && !allowedRoles.includes(profile.role)) {
          // Redirect to appropriate dashboard based on role
          switch (profile.role) {
            case UserRole.CUSTOMER:
              router.push('/dashboard/user');
              break;
            case UserRole.SELLER:
              router.push('/dashboard/seller');
              break;
            case UserRole.ARCHITECT:
              router.push('/dashboard/architect');
              break;
            case UserRole.ARCHITECT_CLIENT:
              router.push('/dashboard/architect-client');
              break;
            case UserRole.ADMIN:
            case UserRole.SUPER_ADMIN:
              router.push('/dashboard/admin');
              break;
            default:
              router.push('/dashboard/user');
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // If profile doesn't exist, try to create one
        try {
          const response = await fetch('/api/users/onboard', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          if (response.ok) {
            // Profile created, retry fetching
            const profile = await getUserProfile(user.id);
            setUserProfile(profile);
            return;
          }
        } catch (createError) {
          console.error('Failed to create user profile:', createError);
        }
        router.push('/');
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, [user, isLoaded, allowedRoles, router]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/sign-in');
    return null;
  }

  if (!userProfile) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600">Please complete your registration</p>
        </div>
      </div>
    );
  }

  if (!allowedRoles.includes(userProfile.role)) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}