'use client';

import { useState } from 'react';

interface Props {
  user: {
    id: string;
    email: string;
  };
}

export default function SetupAdminClient({ user }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const setupAdmin = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage('Super admin created! You can now access /admin');
        setTimeout(() => {
          window.location.href = '/admin';
        }, 2000);
      } else {
        setMessage(data.error || 'Setup failed');
      }
    } catch (error) {
      setMessage('Setup failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Setup Super Admin</h1>
        <p className="text-gray-600 mb-6">
          Click below to make yourself the super admin. This can only be done once.
        </p>
        
        <div className="mb-4">
          <p><strong>User:</strong> {user.email}</p>
          <p><strong>ID:</strong> {user.id}</p>
        </div>

        <button
          onClick={setupAdmin}
          disabled={loading}
          className="w-full bg-[#16a349] text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Setting up...' : 'Become Super Admin'}
        </button>

        {message && (
          <div className={`mt-4 p-3 rounded ${
            message.includes('success') || message.includes('created') 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}