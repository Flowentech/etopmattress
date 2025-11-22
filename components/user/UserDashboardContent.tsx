'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ShoppingCart,
  Package,
  DollarSign,
  TrendingUp,
  Building2,
  FileText,
  Clock,
  CheckCircle,
  Truck,
  Star,
  User,
  Settings,
  PlusCircle,
  Eye,
  Heart,
  MapPin,
  Calendar,
  AlertCircle,
  Home,
  History,
  ShoppingBag
} from 'lucide-react';
import UserSettings from './UserSettings';
import { getUserProfile } from '@/lib/auth/user-profile';
import { UserRole } from '@/types/roles';

interface ShoppingStats {
  totalOrders: number;
  totalSpent: number;
  pendingOrders: number;
  completedOrders: number;
  wishlistItems: number;
  averageOrderValue: number;
}

interface ArchitectureStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalSpent: number;
  pendingProposals: number;
  averageProjectValue: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  itemCount: number;
  orderDate: string;
  storeName: string;
}

interface RecentProject {
  id: string;
  projectTitle: string;
  status: string;
  budget: { min: number; max: number };
  location: { city: string };
  proposalCount: number;
  createdAt: string;
}

export default function UserDashboardContent() {
  const { user } = useUser();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [shoppingStats, setShoppingStats] = useState<ShoppingStats>({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
    completedOrders: 0,
    wishlistItems: 0,
    averageOrderValue: 0,
  });
  const [architectureStats, setArchitectureStats] = useState<ArchitectureStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalSpent: 0,
    pendingProposals: 0,
    averageProjectValue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Get user profile
      if (!user?.id) return;
      let profile = await getUserProfile(user.id);

      // If no profile exists, create one automatically
      if (!profile) {
        try {
          const response = await fetch('/api/users/onboard', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          if (response.ok) {
            const data = await response.json();
            profile = data.profile;
            console.log('Created automatic profile for user:', user.id);
          }
        } catch (createError) {
          console.error('Failed to create user profile:', createError);
        }
      }

      // If still no profile, create a basic one client-side
      if (!profile) {
        profile = {
          _id: user.id,
          clerkId: user.id,
          email: user.emailAddresses?.[0]?.emailAddress || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          role: 'customer',
          isActive: true,
          isVerified: true,
          preferences: {
            enableShopping: true,
            enableArchitectureServices: false,
            defaultDashboard: 'shopping'
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };
        console.log('Using fallback profile for user:', user.id);
      }

      setUserProfile(profile);

      // Set default tab based on user preferences
      if (profile?.preferences?.defaultDashboard) {
        setActiveTab(profile.preferences.defaultDashboard);
      } else if (profile?.role === 'architect_client') {
        setActiveTab('architecture');
      } else {
        setActiveTab('shopping');
      }

      // Fetch shopping data if user has shopping enabled
      if (profile?.preferences?.enableShopping !== false) {
        await fetchShoppingData();
      }

      // Fetch architecture data if user has architecture services enabled
      if (profile?.preferences?.enableArchitectureServices !== false &&
          profile?.role && ['architect_client', 'customer_architect_client'].includes(profile.role)) {
        await fetchArchitectureData();
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShoppingData = async () => {
    try {
      if (!user?.id) return;
      // Fetch user orders
      const ordersResponse = await fetch(`/api/users/orders?userId=${user.id}&limit=5`);
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setRecentOrders(ordersData.orders || []);
      }

      // Fetch user stats
      const statsResponse = await fetch(`/api/users/stats?userId=${user.id}`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setShoppingStats(statsData);
      }

      // Fetch wishlist count
      const wishlistResponse = await fetch(`/api/wishlist?userId=${user.id}`);
      if (wishlistResponse.ok) {
        const wishlistData = await wishlistResponse.json();
        setShoppingStats(prev => ({
          ...prev,
          wishlistItems: wishlistData.items?.length || 0
        }));
      }

    } catch (error) {
      console.error('Error fetching shopping data:', error);
    }
  };

  const fetchArchitectureData = async () => {
    try {
      if (!user?.id) return;
      // Fetch user projects
      const projectsResponse = await fetch(`/api/architecture/client/projects?clientId=${user.id}`);
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        setRecentProjects(projectsData.projects?.slice(0, 5) || []);
      }

      // Fetch architecture stats
      const statsResponse = await fetch(`/api/architecture/client/stats?clientId=${user.id}`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setArchitectureStats(statsData);
      }

    } catch (error) {
      console.error('Error fetching architecture data:', error);
    }
  };

  const hasShoppingAccess = userProfile?.preferences?.enableShopping !== false;
  const hasArchitectureAccess = userProfile?.preferences?.enableArchitectureServices !== false &&
                               ['architect_client', 'customer_architect_client'].includes(userProfile?.role);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.firstName || 'User'}!
              </h1>
              <p className="text-gray-600">
                Manage your shopping and architecture projects in one place
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Access Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {hasShoppingAccess && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/products">
                <CardContent className="p-6 text-center">
                  <ShoppingBag className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-1">Shop Products</h3>
                  <p className="text-sm text-gray-600">Browse our catalog</p>
                </CardContent>
              </Link>
            </Card>
          )}

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/find-architects">
              <CardContent className="p-6 text-center">
                <Building2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">Find Architects</h3>
                <p className="text-sm text-gray-600">Browse architect directory</p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/dashboard/user?tab=orders">
              <CardContent className="p-6 text-center">
                <History className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">Order History</h3>
                <p className="text-sm text-gray-600">View all orders</p>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            {hasShoppingAccess && (
              <TabsTrigger value="shopping" className="flex items-center space-x-2">
                <ShoppingCart className="w-4 h-4" />
                <span>Shopping</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Home className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Shopping Tab */}
          {hasShoppingAccess && (
            <TabsContent value="shopping" className="space-y-6">
              {/* Shopping Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Orders</p>
                        <p className="text-2xl font-bold text-gray-900">{shoppingStats.totalOrders}</p>
                      </div>
                      <ShoppingCart className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Spent</p>
                        <p className="text-2xl font-bold text-gray-900">
                          ৳{shoppingStats.totalSpent.toLocaleString()}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                        <p className="text-2xl font-bold text-gray-900">{shoppingStats.pendingOrders}</p>
                      </div>
                      <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Wishlist</p>
                        <p className="text-2xl font-bold text-gray-900">{shoppingStats.wishlistItems}</p>
                      </div>
                      <Heart className="h-8 w-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Orders */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Orders</CardTitle>
                  <Link href="/dashboard/user?tab=orders">
                    <Button variant="outline" size="sm">View All</Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOrders.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                        <p className="text-gray-600 mb-4">Start shopping to see your orders here</p>
                        <Link href="/products">
                          <Button>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Start Shopping
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">Order #{order.orderNumber}</h4>
                            <p className="text-sm text-gray-600">{order.storeName}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-500">{order.orderDate}</span>
                              <span className="text-xs text-gray-500">•</span>
                              <span className="text-xs text-gray-500">{order.itemCount} items</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">৳{order.total.toLocaleString()}</p>
                            <Badge variant={
                              order.status === 'delivered' ? 'default' :
                              order.status === 'shipped' ? 'secondary' :
                              order.status === 'processing' ? 'outline' :
                              'destructive'
                            }>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

  
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Shopping Overview */}
              {hasShoppingAccess && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ShoppingCart className="w-5 h-5 mr-2 text-blue-600" />
                      Shopping Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total Orders</span>
                        <span className="text-sm font-bold">{shoppingStats.totalOrders}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total Spent</span>
                        <span className="text-sm font-bold">৳{shoppingStats.totalSpent.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Pending Orders</span>
                        <Badge variant="secondary">{shoppingStats.pendingOrders}</Badge>
                      </div>
                      <div className="pt-4">
                        <Link href="/products">
                          <Button className="w-full">
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Continue Shopping
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Find Architects Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="w-5 h-5 mr-2 text-green-600" />
                    Find Architects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Connect with verified architects and interior designers for your projects.
                    </p>
                    <div className="pt-4">
                      <Link href="/find-architects">
                        <Button className="w-full">
                          <Building2 className="w-4 h-4 mr-2" />
                          Browse Architect Directory
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {hasShoppingAccess && (
                    <>
                      <Link href="/products">
                        <Button variant="outline" className="w-full">
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          Browse Products
                        </Button>
                      </Link>
                      <Link href="/dashboard/user?tab=orders">
                        <Button variant="outline" className="w-full">
                          <Package className="w-4 h-4 mr-2" />
                          My Orders
                        </Button>
                      </Link>
                    </>
                  )}
                  <Link href="/find-architects">
                    <Button variant="outline" className="w-full">
                      <Building2 className="w-4 h-4 mr-2" />
                      Find Architects
                    </Button>
                  </Link>
                  <Link href="/dashboard/user?tab=settings">
                    <Button variant="outline" className="w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <UserSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}