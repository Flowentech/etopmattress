import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import { client } from '@/sanity/lib/client';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Toaster } from 'react-hot-toast';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  // Middleware already handles authentication, so if we're here, user is authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-4">Please sign in to access the admin panel.</p>
          <a href="/sign-in" className="text-primary hover:underline">Go to Sign In</a>
        </div>
      </div>
    );
  }

  // Check if user is admin
  let userProfile = await client.fetch(`
    *[_type == "userProfile" && clerkId == $clerkId][0] {
      _id,
      role,
      email
    }
  `, { clerkId: user.id });

  // If user profile doesn't exist, create it
  if (!userProfile) {
    console.log('User profile not found, creating...');

    try {
      const { backendClient } = await import('@/sanity/lib/backendClient');
      const newProfile = await backendClient.create({
        _type: 'userProfile',
        clerkId: user.id,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.emailAddresses?.[0]?.emailAddress || '',
        role: 'customer', // Default role
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      userProfile = newProfile;
      console.log('Created new user profile');
    } catch (error) {
      console.error('Failed to create user profile:', error);
    }
  }

  // Check if user has admin privileges
  if (!userProfile || !['admin', 'super_admin'].includes(userProfile.role)) {
    // User is not an admin, show access denied
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-lg">
          <div className="mb-4">
            <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You don&apos;t have permission to access the admin panel.
            Please contact an administrator if you believe this is an error.
          </p>
          <div className="space-y-2">
            <a
              href="/"
              className="block w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Go to Home
            </a>
            <p className="text-xs text-gray-500 mt-4">
              Signed in as: {userProfile?.email || user.emailAddresses?.[0]?.emailAddress}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}