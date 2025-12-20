'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tag,
  Search,
  TrendingUp,
  Users,
  DollarSign,
  Loader2,
  ArrowLeft,
  Percent,
  Calendar,
  ShoppingBag,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { client } from '@/sanity/lib/client';
import { defineQuery } from 'next-sanity';
import { Button } from '@/components/ui/button';

interface CouponAnalytics {
  _id: string;
  couponCode: string;
  title: string;
  discountType: 'percentage' | 'fixed';
  discountAmount: number;
  currentUsageCount: number;
  totalRevenue: number;
  totalDiscount: number;
  uniqueUsers: number;
  isActive: boolean;
}

interface UserUsage {
  customerName: string;
  email: string;
  orderNumber: string;
  orderDate: string;
  totalPrice: number;
  amountDiscount: number;
  couponCode: string;
}

export default function CouponAnalyticsPage() {
  const [analytics, setAnalytics] = useState<CouponAnalytics[]>([]);
  const [userUsage, setUserUsage] = useState<UserUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCoupon, setSelectedCoupon] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'usage' | 'revenue' | 'discount'>('usage');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const ANALYTICS_QUERY = defineQuery(`
        *[_type == "sale"] {
          _id,
          couponCode,
          title,
          discountType,
          discountAmount,
          currentUsageCount,
          isActive,
          "totalRevenue": sum(*[_type == "order" && coupon._ref == ^._id].totalPrice),
          "totalDiscount": sum(*[_type == "order" && coupon._ref == ^._id].amountDiscount),
          "uniqueUsers": count(array::unique(*[_type == "order" && coupon._ref == ^._id].clerkUserId))
        } | order(currentUsageCount desc)
      `);

      const data = await client.fetch(ANALYTICS_QUERY);
      setAnalytics(data || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserUsage = async (couponId?: string) => {
    try {
      setLoadingUsers(true);

      const filter = couponId && couponId !== 'all' ? `&& coupon._ref == "${couponId}"` : '';

      const USERS_QUERY = defineQuery(`
        *[_type == "order" && defined(coupon) ${filter}] | order(orderDate desc) [0...100] {
          customerName,
          email,
          orderNumber,
          orderDate,
          totalPrice,
          amountDiscount,
          couponCode
        }
      `);

      const data = await client.fetch(USERS_QUERY);
      setUserUsage(data || []);
    } catch (error) {
      console.error('Error fetching user usage:', error);
      toast.error('Failed to load user usage data');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchUserUsage();
  }, []);

  useEffect(() => {
    if (selectedCoupon) {
      fetchUserUsage(selectedCoupon === 'all' ? undefined : selectedCoupon);
    }
  }, [selectedCoupon]);

  const filteredAnalytics = analytics
    .filter((item) => {
      const search = searchTerm.toLowerCase();
      return (
        item.title.toLowerCase().includes(search) ||
        item.couponCode.toLowerCase().includes(search)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'usage') return b.currentUsageCount - a.currentUsageCount;
      if (sortBy === 'revenue') return (b.totalRevenue || 0) - (a.totalRevenue || 0);
      if (sortBy === 'discount') return (b.totalDiscount || 0) - (a.totalDiscount || 0);
      return 0;
    });

  const filteredUserUsage = userUsage.filter((usage) => {
    const search = searchTerm.toLowerCase();
    return (
      usage.customerName?.toLowerCase().includes(search) ||
      usage.email?.toLowerCase().includes(search) ||
      usage.orderNumber?.toLowerCase().includes(search)
    );
  });

  const totalStats = analytics.reduce(
    (acc, item) => ({
      totalUsage: acc.totalUsage + item.currentUsageCount,
      totalRevenue: acc.totalRevenue + (item.totalRevenue || 0),
      totalDiscount: acc.totalDiscount + (item.totalDiscount || 0),
      uniqueUsers: acc.uniqueUsers + (item.uniqueUsers || 0),
    }),
    { totalUsage: 0, totalRevenue: 0, totalDiscount: 0, uniqueUsers: 0 }
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/coupons">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Coupons
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coupon Analytics</h1>
          <p className="text-gray-500 mt-1">Track coupon performance and user engagement</p>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Usage</CardTitle>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalStats.totalUsage}</div>
            <p className="text-xs text-gray-500 mt-1">Times coupons used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              BDT {totalStats.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">From coupon orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Discount</CardTitle>
            <Tag className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              BDT {totalStats.totalDiscount.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Given to customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Unique Users</CardTitle>
            <Users className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{totalStats.uniqueUsers}</div>
            <p className="text-xs text-gray-500 mt-1">Used coupons</p>
          </CardContent>
        </Card>
      </div>

      {/* Coupon Performance */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Coupon Performance</CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usage">Usage Count</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="discount">Discount Given</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search coupons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : filteredAnalytics.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No analytics data available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Coupon</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead className="text-right">Usage</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Discount Given</TableHead>
                    <TableHead className="text-right">Unique Users</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAnalytics.map((item) => (
                    <TableRow
                      key={item._id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedCoupon(item._id)}
                    >
                      <TableCell>
                        <div>
                          <div className="font-mono font-semibold text-emerald-600">
                            {item.couponCode}
                          </div>
                          <div className="text-sm text-gray-500">{item.title}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {item.discountType === 'percentage' ? (
                            <>
                              <Percent className="w-3 h-3 text-gray-500" />
                              <span>{item.discountAmount}%</span>
                            </>
                          ) : (
                            <>
                              <DollarSign className="w-3 h-3 text-gray-500" />
                              <span>BDT {item.discountAmount}</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {item.currentUsageCount}
                      </TableCell>
                      <TableCell className="text-right text-green-600 font-medium">
                        BDT {(item.totalRevenue || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-orange-600 font-medium">
                        BDT {(item.totalDiscount || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">{item.uniqueUsers || 0}</TableCell>
                      <TableCell>
                        {item.isActive ? (
                          <Badge variant="default" className="bg-green-600">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Usage Details */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>User Usage History</CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={selectedCoupon} onValueChange={setSelectedCoupon}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by coupon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Coupons</SelectItem>
                  {analytics.map((coupon) => (
                    <SelectItem key={coupon._id} value={coupon._id}>
                      {coupon.couponCode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingUsers ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : filteredUserUsage.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No usage history found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Order Number</TableHead>
                    <TableHead>Coupon Code</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead className="text-right">Order Total</TableHead>
                    <TableHead className="text-right">Discount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUserUsage.map((usage, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{usage.customerName}</TableCell>
                      <TableCell>{usage.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <ShoppingBag className="w-3 h-3 text-gray-400" />
                          <span className="font-mono text-sm">{usage.orderNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {usage.couponCode}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-3 h-3" />
                          {formatDate(usage.orderDate)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        BDT {usage.totalPrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-green-600 font-medium">
                        -BDT {usage.amountDiscount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
