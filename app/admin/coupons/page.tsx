'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Tag, Search, Plus, Eye, Percent, DollarSign, Loader2, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { client } from '@/sanity/lib/client';
import { defineQuery } from 'next-sanity';

interface Coupon {
  _id: string;
  title: string;
  couponCode: string;
  discountType: 'percentage' | 'fixed';
  discountAmount: number;
  minOrderValue: number;
  maxDiscount?: number;
  maxUsageCount: number;
  maxUsagePerUser: number;
  currentUsageCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

interface Stats {
  totalCoupons: number;
  activeCoupons: number;
  totalUsage: number;
  totalDiscountGiven: number;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalCoupons: 0,
    activeCoupons: 0,
    totalUsage: 0,
    totalDiscountGiven: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCoupons = async () => {
    try {
      setLoading(true);

      const COUPONS_QUERY = defineQuery(`{
        "coupons": *[_type == "sale"] | order(_createdAt desc) {
          _id,
          title,
          couponCode,
          discountType,
          discountAmount,
          minOrderValue,
          maxDiscount,
          maxUsageCount,
          maxUsagePerUser,
          currentUsageCount,
          validFrom,
          validUntil,
          isActive
        },
        "stats": {
          "totalCoupons": count(*[_type == "sale"]),
          "activeCoupons": count(*[_type == "sale" && isActive == true]),
          "totalUsage": sum(*[_type == "sale"].currentUsageCount),
          "totalDiscountGiven": sum(*[_type == "order" && defined(coupon)].amountDiscount)
        }
      }`);

      const data = await client.fetch(COUPONS_QUERY);

      setCoupons(data.coupons || []);
      setStats({
        totalCoupons: data.stats.totalCoupons || 0,
        activeCoupons: data.stats.activeCoupons || 0,
        totalUsage: data.stats.totalUsage || 0,
        totalDiscountGiven: data.stats.totalDiscountGiven || 0,
      });
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const filteredCoupons = coupons.filter((coupon) => {
    const search = searchTerm.toLowerCase();
    return (
      coupon.title.toLowerCase().includes(search) ||
      coupon.couponCode.toLowerCase().includes(search)
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (coupon: Coupon) => {
    if (!coupon.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }

    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validUntil = new Date(coupon.validUntil);

    if (now < validFrom) {
      return <Badge variant="outline">Scheduled</Badge>;
    }

    if (now > validUntil) {
      return <Badge variant="destructive">Expired</Badge>;
    }

    if (coupon.maxUsageCount > 0 && coupon.currentUsageCount >= coupon.maxUsageCount) {
      return <Badge variant="destructive">Limit Reached</Badge>;
    }

    return <Badge variant="default" className="bg-green-600">Active</Badge>;
  };

  const getUsagePercentage = (coupon: Coupon) => {
    if (coupon.maxUsageCount === 0) return 0;
    return Math.min(100, (coupon.currentUsageCount / coupon.maxUsageCount) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coupon Management</h1>
          <p className="text-gray-500 mt-1">Manage discount codes and promotional offers</p>
        </div>
        <Link href="https://etopmattress.sanity.studio/structure/sale" target="_blank">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Coupon
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Coupons
            </CardTitle>
            <Tag className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCoupons}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Coupons
            </CardTitle>
            <Tag className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeCoupons}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Usage
            </CardTitle>
            <Eye className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalUsage}</div>
            <p className="text-xs text-gray-500 mt-1">Times used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Discount Given
            </CardTitle>
            <DollarSign className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              BDT {stats.totalDiscountGiven.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coupons Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>All Coupons</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search coupons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : filteredCoupons.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'No coupons found' : 'No coupons created yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Valid Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCoupons.map((coupon) => {
                    const usagePercentage = getUsagePercentage(coupon);
                    return (
                      <TableRow key={coupon._id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-emerald-600" />
                            <span className="font-mono font-semibold">{coupon.couponCode}</span>
                          </div>
                        </TableCell>
                        <TableCell>{coupon.title}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {coupon.discountType === 'percentage' ? (
                              <>
                                <Percent className="w-3 h-3 text-gray-500" />
                                <span>{coupon.discountAmount}%</span>
                              </>
                            ) : (
                              <>
                                <DollarSign className="w-3 h-3 text-gray-500" />
                                <span>BDT {coupon.discountAmount}</span>
                              </>
                            )}
                          </div>
                          {coupon.minOrderValue > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              Min: BDT {coupon.minOrderValue}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {coupon.currentUsageCount}
                                {coupon.maxUsageCount > 0 && ` / ${coupon.maxUsageCount}`}
                              </span>
                            </div>
                            {coupon.maxUsageCount > 0 && (
                              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                <div
                                  className="bg-emerald-600 h-1.5 rounded-full transition-all"
                                  style={{ width: `${usagePercentage}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs space-y-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              <span>{formatDate(coupon.validFrom)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-500">
                              <span>to</span>
                              <span>{formatDate(coupon.validUntil)}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(coupon)}</TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`https://etopmattress.sanity.studio/structure/sale;${coupon._id}`}
                            target="_blank"
                          >
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
