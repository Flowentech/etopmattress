"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, ShoppingCart, Users, Package } from "lucide-react";

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState({
    revenue: { total: 0, thisMonth: 0, lastMonth: 0, growth: 0 },
    orders: { total: 0, thisMonth: 0, pending: 0, completed: 0, confirmed: 0, processing: 0, delivered: 0 },
    users: { total: 0, active: 0, newThisMonth: 0 },
    products: { total: 0, active: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const res = await fetch("/api/admin/analytics");
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Analytics API error:", errorData.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Analytics</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-8 w-12 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <p className="text-gray-600">Platform overview and store-specific insights</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
                <p className="text-3xl font-bold">${analytics.revenue.total.toFixed(2)}</p>
                <p className="text-sm text-emerald-600 mt-1">+{analytics.revenue.growth}% this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold">{analytics.orders.total}</p>
                <p className="text-sm text-gray-600 mt-1">{analytics.orders.pending} pending</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Active Users</p>
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-3xl font-bold">{analytics.users.active}</p>
                <p className="text-sm text-gray-600 mt-1">{analytics.users.newThisMonth} new this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Total Products</p>
                  <Package className="h-5 w-5 text-indigo-600" />
                </div>
                <p className="text-3xl font-bold">{analytics.products.total}</p>
                <p className="text-sm text-gray-600 mt-1">{analytics.products.active} active</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">This Month</span>
                    <span className="font-bold">${analytics.revenue.thisMonth.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Month</span>
                    <span className="font-bold">${analytics.revenue.lastMonth.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Growth</span>
                    <span className="font-bold text-emerald-600">+{analytics.revenue.growth}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Order Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Orders</span>
                    <span className="font-bold">{analytics.orders.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">This Month</span>
                    <span className="font-bold">{analytics.orders.thisMonth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pending</span>
                    <span className="font-bold text-yellow-600">{analytics.orders.pending}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Confirmed</span>
                    <span className="font-bold text-blue-600">{analytics.orders.confirmed || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Processing</span>
                    <span className="font-bold text-purple-600">{analytics.orders.processing || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivered</span>
                    <span className="font-bold text-green-600">{analytics.orders.delivered || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed</span>
                    <span className="font-bold text-emerald-600">{analytics.orders.completed}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>User Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Users</span>
                    <span className="font-bold">{analytics.users.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Users</span>
                    <span className="font-bold text-green-600">{analytics.users.active}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">New This Month</span>
                    <span className="font-bold text-blue-600">{analytics.users.newThisMonth}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
