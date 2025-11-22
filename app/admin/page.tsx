import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ShoppingCart,
  Users,
  Bell,
  Settings,
  Package
} from 'lucide-react';
import { Suspense } from 'react';
import Link from 'next/link';
import EnhancedAdminStats from '@/components/admin/EnhancedAdminStats';
import RecentOrders from '@/components/admin/RecentOrders';
import RecentProducts from '@/components/admin/RecentProducts';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your InterioWale marketplace</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <Link href="/admin/products">
            <CardContent className="p-6 text-center cursor-pointer">
              <Package className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Products</h3>
              <p className="text-sm text-gray-600">Manage all products</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <Link href="/admin/orders">
            <CardContent className="p-6 text-center cursor-pointer">
              <ShoppingCart className="w-12 h-12 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Orders</h3>
              <p className="text-sm text-gray-600">Track orders</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <Link href="/admin/users">
            <CardContent className="p-6 text-center cursor-pointer">
              <Users className="w-12 h-12 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Users</h3>
              <p className="text-sm text-gray-600">Manage users</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <Link href="/admin/notifications">
            <CardContent className="p-6 text-center cursor-pointer">
              <Bell className="w-12 h-12 text-pink-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Notifications</h3>
              <p className="text-sm text-gray-600">Send announcements</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <Link href="/admin/settings">
            <CardContent className="p-6 text-center cursor-pointer">
              <Settings className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Settings</h3>
              <p className="text-sm text-gray-600">Configure system settings</p>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Enhanced Analytics */}
      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      }>
        <EnhancedAdminStats />
      </Suspense>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        }>
          <RecentOrders />
        </Suspense>

        <Suspense fallback={
          <Card>
            <CardHeader>
              <CardTitle>Recent Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        }>
          <RecentProducts />
        </Suspense>
      </div>
    </div>
  );
}