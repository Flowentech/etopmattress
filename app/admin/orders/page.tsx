'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  ShoppingBag,
  Search,
  Filter,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Package,
  Loader2,
  Eye,
  RefreshCw,
  Trash2,
  Truck,
  MapPin
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  customerPhone?: string;
  totalPrice: number;
  currency: string;
  status: string;
  orderDate: string;
  platformFee: number;
  storeEarnings: number;
  payoutStatus: string;
  storeName: string;
  storeSlug: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

interface OrdersResponse {
  orders: Order[];
  stats: {
    total: number;
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [shipmentDialogOpen, setShipmentDialogOpen] = useState(false);
  const [shipmentData, setShipmentData] = useState({
    trackingNumber: '',
    estimatedDelivery: '',
    courierService: 'steadfast',
    notes: ''
  });
  const [isShipping, setIsShipping] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: false
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  });

  useEffect(() => {
    loadOrders();
  }, [statusFilter, pagination.offset]);

  const loadOrders = async () => {
    try {
      setError(null);
      setLoading(true);

      const params = new URLSearchParams();
      params.append('limit', pagination.limit.toString());
      params.append('offset', pagination.offset.toString());
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/admin/orders?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        setOrders(result.data.orders || []);
        setStats(result.data.stats || stats);
        setPagination(result.data.pagination || pagination);
      } else {
        console.error('Unexpected API response structure:', result);
        toast.error('Failed to load orders: Invalid response format');
        setOrders([]);
        setStats({
          total: 0,
          pending: 0,
          confirmed: 0,
          processing: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0
        });
      }
    } catch (error: any) {
      console.error('Error loading orders:', error);
      const errorMessage = error?.message || 'Failed to load orders';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      confirmed: { color: 'bg-blue-100 text-blue-800', label: 'Confirmed' },
      processing: { color: 'bg-purple-100 text-purple-800', label: 'Processing' },
      shipped: { color: 'bg-indigo-100 text-indigo-800', label: 'Shipped' },
      delivered: { color: 'bg-green-100 text-green-800', label: 'Delivered' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };

    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const handleLoadMore = () => {
    setPagination(prev => ({
      ...prev,
      offset: prev.offset + prev.limit
    }));
  };

  const handleRefresh = () => {
    setPagination({
      total: 0,
      limit: 10,
      offset: 0,
      hasMore: false
    });
    loadOrders();
  };

  const handleDeleteOrder = async (order: Order) => {
    // Prevent deletion of orders that are already being processed
    if (['processing', 'shipped', 'out_for_delivery'].includes(order.status)) {
      toast.error('Cannot delete order that is being processed');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete order #${order.orderNumber}? This action cannot be undone.\n\nCustomer: ${order.customerName}\nTotal: ${formatPrice(order.totalPrice, order.currency)}`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/orders?id=${order._id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message || 'Order deleted successfully');
        // Refresh the orders list
        loadOrders();
      } else {
        toast.error(result.error || 'Failed to delete order');
      }
    } catch (error: any) {
      console.error('Error deleting order:', error);
      toast.error(error?.message || 'Failed to delete order');
    }
  };

  const handleShipOrder = (order: Order) => {
    setSelectedOrder(order);
    setShipmentData({
      trackingNumber: order.trackingNumber || '',
      estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery).toISOString().split('T')[0] : '',
      courierService: 'steadfast',
      notes: ''
    });
    setShipmentDialogOpen(true);
  };

  const handleUpdateShipment = async () => {
    if (!selectedOrder) return;

    if (!shipmentData.trackingNumber) {
      toast.error('Tracking number is required');
      return;
    }

    setIsShipping(true);

    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder._id}/ship`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trackingNumber: shipmentData.trackingNumber,
          estimatedDelivery: shipmentData.estimatedDelivery,
          courierService: shipmentData.courierService,
          notes: shipmentData.notes,
          status: 'shipped'
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Order shipped successfully!');
        setShipmentDialogOpen(false);
        loadOrders(); // Refresh orders
      } else {
        toast.error(result.error || 'Failed to ship order');
      }
    } catch (error: any) {
      console.error('Error shipping order:', error);
      toast.error(error?.message || 'Failed to ship order');
    } finally {
      setIsShipping(false);
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Orders</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Orders</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadOrders}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
          <p className="text-gray-600">Manage customer orders and fulfillment</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <ShoppingBag className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-purple-600">{stats.processing}</p>
              </div>
              <Package className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-medium">
                      #{order.orderNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-sm text-gray-500">{order.email}</p>
                        {order.customerPhone && (
                          <p className="text-sm text-gray-500">{order.customerPhone}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.storeName}</p>
                        <p className="text-sm text-gray-500">{order.storeSlug}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {order.items.slice(0, 2).map((item, index) => (
                          <p key={index} className="text-sm">
                            {item.quantity}x {item.name}
                          </p>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-sm text-gray-500">
                            +{order.items.length - 2} more
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{formatPrice(order.totalPrice, order.currency)}</p>
                        <p className="text-sm text-gray-500">
                          Store: {formatPrice(order.storeEarnings, order.currency)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(order.status)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{formatDate(order.orderDate)}</p>
                        <p className="text-xs text-gray-500">
                          {order.payoutStatus}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {['pending', 'confirmed', 'paid'].includes(order.status) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShipOrder(order)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Truck className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteOrder(order)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={['processing', 'shipped', 'out_for_delivery'].includes(order.status)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No orders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Load More */}
          {pagination.hasMore && (
            <div className="flex justify-center mt-6">
              <Button
                onClick={handleLoadMore}
                variant="outline"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Order Number</p>
                  <p className="font-medium">#{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-medium">{selectedOrder.customerName}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.email}</p>
                  {selectedOrder.customerPhone && (
                    <p className="text-sm text-gray-500">{selectedOrder.customerPhone}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Store</p>
                  <p className="font-medium">{selectedOrder.storeName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-medium">{formatDate(selectedOrder.orderDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payout Status</p>
                  <p className="font-medium">{selectedOrder.payoutStatus}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Order Items</p>
                <div className="border rounded-lg divide-y">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="p-3 flex justify-between">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-medium">{formatPrice(item.price * item.quantity, selectedOrder.currency)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <p className="text-gray-600">Subtotal</p>
                  <p className="font-medium">{formatPrice(selectedOrder.totalPrice, selectedOrder.currency)}</p>
                </div>
                <div className="flex justify-between mb-2">
                  <p className="text-gray-600">Platform Fee</p>
                  <p className="font-medium">{formatPrice(selectedOrder.platformFee, selectedOrder.currency)}</p>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <p>Store Earnings</p>
                  <p>{formatPrice(selectedOrder.storeEarnings, selectedOrder.currency)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Shipment Dialog */}
      <Dialog open={shipmentDialogOpen} onOpenChange={setShipmentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Ship Order
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-sm">Order #{selectedOrder.orderNumber}</p>
                <p className="text-sm text-gray-600">{selectedOrder.customerName}</p>
                <p className="text-sm text-gray-600">{selectedOrder.email}</p>
                {selectedOrder.customerPhone && (
                  <p className="text-sm text-gray-600">{selectedOrder.customerPhone}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Courier Service</label>
                <Select
                  value={shipmentData.courierService}
                  onValueChange={(value) => setShipmentData({ ...shipmentData, courierService: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="steadfast">Steadfast</SelectItem>
                    <SelectItem value="pathao">Pathao</SelectItem>
                    <SelectItem value="redx">RedX</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Tracking Number *</label>
                <Input
                  value={shipmentData.trackingNumber}
                  onChange={(e) => setShipmentData({ ...shipmentData, trackingNumber: e.target.value })}
                  placeholder="Enter tracking number"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Estimated Delivery</label>
                <Input
                  type="date"
                  value={shipmentData.estimatedDelivery}
                  onChange={(e) => setShipmentData({ ...shipmentData, estimatedDelivery: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Notes (Optional)</label>
                <Textarea
                  value={shipmentData.notes}
                  onChange={(e) => setShipmentData({ ...shipmentData, notes: e.target.value })}
                  placeholder="Any delivery notes or instructions"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShipmentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateShipment} disabled={isShipping || !shipmentData.trackingNumber}>
                  {isShipping ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Shipping...
                    </>
                  ) : (
                    <>
                      <Truck className="h-4 w-4 mr-2" />
                      Ship Order
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}