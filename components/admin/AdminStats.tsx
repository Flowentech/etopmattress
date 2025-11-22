'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Store,
  Bot,
  TrendingUp
} from 'lucide-react';

interface AdminStatsData {
  totalRevenue: number;
  totalCommissions: number;
  totalOrders: number;
  activeUsers: number;
  activeStores: number;
  aiGenerations: number;
  transactionCount: number;
  pendingPayouts: number;
}

export default function AdminStats() {
  const [stats, setStats] = useState<AdminStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Load commission stats
      const commissionResponse = await fetch('/api/admin/commission/stats');
      const commissionData = await commissionResponse.json();

      // For now, we'll use commission data and mock other stats
      // In a real implementation, you'd fetch these from respective APIs
      const statsData: AdminStatsData = {
        totalRevenue: commissionData.totalRevenue || 0,
        totalCommissions: commissionData.totalCommissions || 0,
        totalOrders: commissionData.transactionCount || 0,
        activeUsers: 0, // Would come from user analytics
        activeStores: 0, // Would come from store analytics
        aiGenerations: 0, // Would come from AI analytics
        transactionCount: commissionData.transactionCount || 0,
        pendingPayouts: commissionData.pendingPayouts || 0
      };

      setStats(statsData);
    } catch (error) {
      console.error('Error loading admin stats:', error);
      // Fallback to mock data
      setStats({
        totalRevenue: 45231.89,
        totalCommissions: 4523.19,
        totalOrders: 2350,
        activeUsers: 12234,
        activeStores: 23,
        aiGenerations: 1429,
        transactionCount: 0,
        pendingPayouts: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
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
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">
            From {formatNumber(stats.transactionCount)} transactions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Commission Earned</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalCommissions)}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalRevenue > 0 ? 
              `${((stats.totalCommissions / stats.totalRevenue) * 100).toFixed(1)}% commission rate` : 
              'Platform fees'
            }
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
          <DollarSign className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.pendingPayouts)}</div>
          <p className="text-xs text-muted-foreground">Ready for store payouts</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats.totalOrders)}</div>
          <p className="text-xs text-muted-foreground">Marketplace transactions</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Stores</CardTitle>
          <Store className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats.activeStores)}</div>
          <p className="text-xs text-muted-foreground">Registered merchants</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">AI Generations</CardTitle>
          <Bot className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats.aiGenerations)}</div>
          <p className="text-xs text-muted-foreground">Interior designs created</p>
        </CardContent>
      </Card>
    </div>
  );
}