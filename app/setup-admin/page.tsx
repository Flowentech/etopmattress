import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import SetupAdminClient from './SetupAdminClient';

export default async function SetupAdminPage() {
  const user = await currentUser();
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">Setup Super Admin</h1>
          <p className="text-gray-600 mb-6">Please sign in first to setup admin access.</p>
          <a href="/sign-in" className="bg-[#16a349] text-white py-2 px-4 rounded hover:bg-green-600">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  const userData = {
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress || ''
  };

  return <SetupAdminClient user={userData} />;
}