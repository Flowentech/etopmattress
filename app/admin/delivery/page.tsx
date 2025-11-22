'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  MapPin,
  BarChart3,
  TrendingUp,
  RefreshCw,
  Eye,
  Filter,
  Search,
  Store,
  Users,
  Calendar,
  DollarSign,
  ArrowUpDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ShipmentStatus } from '@/types/fulfillment';

interface Store {
  _id: string;
  name: string;
  slug: { current: string };
  owner: {
    name: string;
    email: string;
  };
  settings: {
    isActive: boolean;
    isApproved: boolean;
  };
}

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  totalAmount: number;
  status: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    sellerId: string;
    storeId: string;
  }>;
  deliveryAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode?: string;
    country: string;
  };
  trackingNumber?: string;
  estimatedDelivery?: string;
  storeId: string;
  store?: Store;
  createdAt: string;
  updatedAt: string;
}

interface ShipmentDetails {
  _id: string;
  orderId: string;
  courierService: string;
  serviceType: 'standard' | 'express' | 'same_day';
  trackingNumber: string;
  estimatedDelivery?: string;
  deliveryCharge: number;
  status: ShipmentStatus;
  deliveryAddress: any;
  store?: Store;
  createdAt: string;
  updatedAt: string;
  trackingEvents: Array<{
    timestamp: string;
    status: string;
    location: string;
    description: string;
  }>;
}

export default function AdminDeliveryManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [shipments, setShipments] = useState<ShipmentDetails[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [storeFilter, setStoreFilter] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);

  // Statistics
  const [stats, setStats] = useState({
    totalOrders: 0,
    processedToday: 0,
    inTransit: 0,
    delivered: 0,
    failedDeliveryRate: 0,
    averageDeliveryTime: 0,
    totalShipmentRevenue: 0,
    activeStores: 0
  });

  useEffect(() => {
    loadData();
  }, [activeTab, refreshKey, storeFilter]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load stores
      const storesResponse = await fetch('/api/admin/stores');
      if (storesResponse.ok) {
        const storesData = await storesResponse.json();
        setStores(storesData.stores || []);
      }

      // Load orders based on active tab
      let statusFilterQuery = '';
      if (activeTab === 'pending') {
        statusFilterQuery = '&status=pending,confirmed,paid';
      } else if (activeTab === 'in_transit') {
        statusFilterQuery = '&status=processing,shipped,out_for_delivery';
      } else if (activeTab === 'delivered') {
        statusFilterQuery = '&status=delivered';
      }

      // Add store filtering
      if (storeFilter !== 'all') {
        statusFilterQuery += `&storeId=${storeFilter}`;
      }

      const response = await fetch(`/api/admin/orders?${statusFilterQuery}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        setStats(prev => ({ ...prev, ...data.statistics }));
      }

      // Load shipments
      const shipmentsResponse = await fetch('/api/admin/shipments');
      if (shipmentsResponse.ok) {
        const shipmentsData = await shipmentsResponse.json();
        setShipments(shipmentsData.shipments || []);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getShipmentStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      [ShipmentStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [ShipmentStatus.BOOKED]: 'bg-blue-100 text-blue-800',
      [ShipmentStatus.PICKED_UP]: 'bg-purple-100 text-purple-800',
      [ShipmentStatus.IN_TRANSIT]: 'bg-indigo-100 text-indigo-800',
      [ShipmentStatus.OUT_FOR_DELIVERY]: 'bg-orange-100 text-orange-800',
      [ShipmentStatus.DELIVERED]: 'bg-green-100 text-green-800',
      [ShipmentStatus.FAILED_ATTEMPT]: 'bg-red-100 text-red-800',
      [ShipmentStatus.RETURNED]: 'bg-gray-100 text-gray-800',
      [ShipmentStatus.CANCELLED]: 'bg-red-100 text-red-800'
    };

    const statusLabels: Record<string, string> = {
      [ShipmentStatus.PENDING]: 'Pending',
      [ShipmentStatus.BOOKED]: 'Booked',
      [ShipmentStatus.PICKED_UP]: 'Picked Up',
      [ShipmentStatus.IN_TRANSIT]: 'In Transit',
      [ShipmentStatus.OUT_FOR_DELIVERY]: 'Out for Delivery',
      [ShipmentStatus.DELIVERED]: 'Delivered',
      [ShipmentStatus.FAILED_ATTEMPT]: 'Failed Attempt',
      [ShipmentStatus.RETURNED]: 'Returned',
      [ShipmentStatus.CANCELLED]: 'Cancelled'
    };

    return (
      <Badge className={statusStyles[status] || 'bg-gray-100 text-gray-800'}>
        {statusLabels[status] || status}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-BD', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesStore = storeFilter === 'all' || order.storeId === storeFilter;

    return matchesSearch && matchesStatus && matchesStore;
  });

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = searchTerm === '' ||
      shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.orderId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;
    const matchesStore = storeFilter === 'all' || shipment.storeId === storeFilter;

    return matchesSearch && matchesStatus && matchesStore;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Delivery Management</h1>
          <p className="text-gray-600 mt-2">Manage all orders, shipments, and delivery operations across all stores</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">Across all stores</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Transit</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inTransit}</div>
              <p className="text-xs text-muted-foreground">Currently shipping</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.delivered}</div>
              <p className="text-xs text-muted-foreground">Successfully delivered</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Stores</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeStores}</div>
              <p className="text-xs text-muted-foreground">Processing orders</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search orders, customers, tracking numbers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>

              <Select value={storeFilter} onValueChange={setStoreFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Stores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stores</SelectItem>
                  {stores.map((store) => (
                    <SelectItem key={store._id} value={store._id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => setRefreshKey(prev => prev + 1)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Order Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">
              Overview ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({orders.filter(o => ['pending', 'confirmed', 'paid'].includes(o.status)).length})
            </TabsTrigger>
            <TabsTrigger value="in_transit">
              In Transit ({orders.filter(o => ['processing', 'shipped', 'out_for_delivery'].includes(o.status)).length})
            </TabsTrigger>
            <TabsTrigger value="delivered">
              Delivered ({orders.filter(o => o.status === 'delivered').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Store</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tracking</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.slice(0, 10).map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-mono">{order.orderNumber}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.customerName}</p>
                            <p className="text-sm text-gray-500">{order.customerEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.store?.name || 'Unknown Store'}</p>
                            <p className="text-sm text-gray-500">{order.storeId}</p>
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                        <TableCell>
                          <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono">
                          {order.trackingNumber ? (
                            <Badge variant="outline">
                              {order.trackingNumber}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">No tracking</Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {/* Similar table structure for pending orders */}
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Pending Orders</h3>
                <p className="text-gray-600">Orders waiting to be processed and shipped.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="in_transit" className="space-y-4">
            {/* Similar table structure for in-transit orders */}
            <Card>
              <CardContent className="p-8 text-center">
                <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Orders In Transit</h3>
                <p className="text-gray-600">Orders currently being shipped to customers.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delivered" className="space-y-4">
            {/* Similar table structure for delivered orders */}
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Delivered Orders</h3>
                <p className="text-gray-600">Successfully delivered orders.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}