import { Suspense } from 'react';
import NotificationCenter from '@/components/admin/NotificationCenter';

export const metadata = {
  title: 'Notification Center | Admin Dashboard',
  description: 'Manage notifications and announcements',
};

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }>
        <NotificationCenter />
      </Suspense>
    </div>
  );
}