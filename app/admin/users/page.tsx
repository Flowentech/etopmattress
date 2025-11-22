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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  DollarSign,
  Eye,
  Edit,
  Ban,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface UserProfile {
  _id: string;
  clerkId: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: 'customer' | 'seller' | 'admin' | 'super_admin';
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  profilePicture?: string;
  phone?: string;
  store?: {
    _id: string;
    name: string;
    slug: string;
    status: string;
  };
  totalOrders?: number;
  totalSpent?: number;
}

interface UsersResponse {
  users: UserProfile[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  stats: {
    roles: {
      total: number;
      customer: number;
      seller: number;
      admin: number;
      super_admin: number;
    };
    statuses: {
      total: number;
      active: number;
      inactive: number;
      suspended: number;
    };
  };
}

export default function UsersManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [stats, setStats] = useState<UsersResponse['stats'] | null>(null);
  const [pagination, setPagination] = useState<UsersResponse['pagination'] | null>(null);

  // Edit dialog state
  const [editRole, setEditRole] = useState<string>('customer');
  const [editStatus, setEditStatus] = useState<string>('active');

  useEffect(() => {
    loadUsers();
  }, [roleFilter, searchTerm]);

  const loadUsers = async () => {
    try {
      setError(null);
      setLoading(true);

      const params = new URLSearchParams();
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/admin/users?${params}`);

      if (!response.ok) {
        // Only set error for actual HTTP errors
        const result = await response.json();
        const errorMessage = result.error?.message || result.error || `HTTP error ${response.status}`;
        console.error('API Error:', errorMessage, result.error);
        setError(errorMessage);
        setUsers([]);
        setStats(null);
        setPagination(null);
        return;
      }

      const result = await response.json();

      if (result.success && result.data) {
        // Successfully loaded data (even if empty)
        setUsers(result.data.users || []);
        setStats(result.data.stats || {
          roles: {
            total: 0,
            customer: 0,
            seller: 0,
            admin: 0,
            super_admin: 0
          },
          statuses: {
            total: 0,
            active: 0,
            inactive: 0,
            suspended: 0
          }
        });
        setPagination(result.data.pagination || {
          total: 0,
          limit: 20,
          offset: 0,
          hasMore: false
        });
      } else {
        // API returned success: false
        const errorMessage = result.error?.message || result.error || 'Unknown API error';
        console.error('API Error:', errorMessage, result.error);
        setError(errorMessage);
        setUsers([]);
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to load users';
      console.error('Error loading users:', error);
      setError(errorMessage);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: string, status: string) => {
    try {
      setIsUpdating(true);

      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role, status })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('User updated successfully');
        loadUsers();
        setEditDialogOpen(false);
        setSelectedUser(null);
      } else {
        const errorMessage = result.error?.message || 'Failed to update user';
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to update user';
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const getRoleBadge = (role?: string) => {
    const roleStyles: Record<string, string> = {
      'customer': 'bg-gray-100 text-gray-800 border-gray-200',
      'seller': 'bg-blue-100 text-blue-800 border-blue-200',
      'admin': 'bg-purple-100 text-purple-800 border-purple-200',
      'super_admin': 'bg-red-100 text-red-800 border-red-200',
      'unknown': 'bg-gray-100 text-gray-800 border-gray-200'
    };

    const safeRole = role && typeof role === 'string' ? role : 'unknown';

    const displayText = safeRole ? String(safeRole).replace('_', ' ').toUpperCase() : 'UNKNOWN';

    return (
      <Badge variant="outline" className={roleStyles[safeRole] || 'bg-gray-100 text-gray-800'}>
        {displayText}
      </Badge>
    );
  };

  const getStatusBadge = (status?: string | boolean | null) => {
    const statusStyles: Record<string, string> = {
      'active': 'bg-green-100 text-green-800 border-green-200',
      'inactive': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'suspended': 'bg-red-100 text-red-800 border-red-200',
      'true': 'bg-green-100 text-green-800 border-green-200',
      'false': 'bg-red-100 text-red-800 border-red-200',
      'unknown': 'bg-gray-100 text-gray-800 border-gray-200'
    };

    let safeStatus = 'unknown';

    if (status === true) {
      safeStatus = 'true';
    } else if (status === false) {
      safeStatus = 'false';
    } else if (status && typeof status === 'string') {
      safeStatus = status.toLowerCase();
    }

    const displayText = safeStatus === 'true' ? 'ACTIVE' :
                        safeStatus === 'false' ? 'INACTIVE' :
                        safeStatus ? String(safeStatus).toUpperCase() : 'UNKNOWN';

    return (
      <Badge variant="outline" className={statusStyles[safeStatus] || 'bg-gray-100 text-gray-800'}>
        {displayText}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const handleEditUser = (user: UserProfile) => {
    setSelectedUser(user);
    setEditRole(user.role);
    // Convert isActive boolean to status string
    if (user.isActive === true) {
      setEditStatus('active');
    } else if (user.isActive === false) {
      setEditStatus('inactive');
    } else {
      setEditStatus('active'); // Default
    }
    setEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Users Management</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
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

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Users</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadUsers}>Try Again</Button>
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
          <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
          <p className="text-gray-600">Manage user accounts, roles, and permissions</p>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{stats.roles.total}</p>
                </div>
                <Users className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Customers</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.roles.customer}</p>
                </div>
                <Users className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Sellers</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.roles.seller}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Admins</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.roles.admin}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Super Admins</p>
                  <p className="text-2xl font-bold text-red-600">{stats.roles.super_admin}</p>
                </div>
                <Users className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{stats.statuses.active}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Inactive</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.statuses.inactive}</p>
                </div>
                <Ban className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Suspended</p>
                  <p className="text-2xl font-bold text-red-600">{stats.statuses.suspended}</p>
                </div>
                <Ban className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="customer">Customers</SelectItem>
                  <SelectItem value="seller">Sellers</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                  <SelectItem value="super_admin">Super Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({pagination?.total || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Clerk ID</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Store</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Spent</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users && Array.isArray(users) && users.map((user) => {
                    if (!user || user === undefined || user === null) return null;
                    return (
                    <TableRow key={user._id || Math.random()}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">
                              {user.firstName && user.lastName
                                ? `${user.firstName} ${user.lastName}`
                                : user.email?.split('@')[0] || 'Unknown User'
                              }
                            </p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            {user.phone && (
                              <p className="text-xs text-gray-400 flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {user.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {user.clerkId || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>{getRoleBadge(user?.role)}</TableCell>
                      <TableCell>{getStatusBadge(user?.isActive)}</TableCell>
                      <TableCell>
                        {user.store ? (
                          <div>
                            <p className="font-medium">{user.store.name}</p>
                            <p className="text-sm text-gray-500">{user.store.status}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400">No store</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <ShoppingBag className="h-4 w-4 mr-1 text-gray-400" />
                          {user.totalOrders || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                          {formatCurrency(user.totalSpent || 0)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{formatDate(user.createdAt)}</p>
                          {user.lastLoginAt && (
                            <p className="text-gray-500">Last: {formatDate(user.lastLoginAt)}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Users Yet</h3>
              <p className="text-gray-600 mb-4">There are no users in the system yet.</p>
              <p className="text-sm text-gray-500">Users will appear here once they sign up and create accounts.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Modify user role and status for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Current Role</label>
                  <div className="mt-1">{getRoleBadge(selectedUser.role)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Current Status</label>
                  <div className="mt-1">{getStatusBadge(selectedUser.isActive)}</div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">New Role</label>
                <Select
                  value={editRole}
                  onValueChange={setEditRole}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="seller">Seller</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">New Status</label>
                <Select
                  value={editStatus}
                  onValueChange={setEditStatus}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedUser && updateUserRole(selectedUser._id, editRole, editStatus)}
              disabled={isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Update User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}