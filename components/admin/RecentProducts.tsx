'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Package, Eye, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

interface RecentProduct {
  _id: string;
  name: string;
  price: number;
  discount: number;
  status: string;
  isApproved: boolean;
  store?: {
    name: string;
  } | null;
  _createdAt: string;
}

export default function RecentProducts() {
  const [products, setProducts] = useState<RecentProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/admin/products?limit=5');
      const result = await response.json();

      if (result.success && result.data) {
        setProducts(result.data.products || []);
      } else {
        setProducts([]);
      }
    } catch (error: any) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      new: { color: 'bg-green-100 text-green-800', label: 'New' },
      hot: { color: 'bg-red-100 text-red-800', label: 'Hot' },
      sale: { color: 'bg-orange-100 text-orange-800', label: 'Sale' },
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };

    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getApprovalBadge = (isApproved: boolean) => {
    return (
      <Badge variant="outline" className={isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
        {isApproved ? (
          <>
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </>
        ) : (
          <>
            <XCircle className="h-3 w-3 mr-1" />
            Pending
          </>
        )}
      </Badge>
    );
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Products</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/products">
            View All
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No products found</p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/products">
                Manage Products
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product._id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{product.name}</h4>
                    {getStatusBadge(product.status)}
                    {getApprovalBadge(product.isApproved)}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span>{product.store?.name || 'Unknown Store'}</span>
                    <span>{formatPrice(product.price)}</span>
                    {product.discount > 0 && (
                      <span className="text-green-600">{product.discount}% off</span>
                    )}
                    <span>{formatDate(product._createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/products?id=${product._id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t">
              <div className="flex items-center justify-center text-sm text-gray-600">
                <TrendingUp className="h-4 w-4 mr-2" />
                Showing {products.length} most recent products
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}