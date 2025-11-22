'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Activity,
  User,
  Calendar,
  Filter,
  Search,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import DateRangePicker from '@/components/admin/analytics/DateRangePicker';
import { toast } from 'react-hot-toast';

interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  resourceName?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  status: 'success' | 'failure' | 'pending';
  metadata?: Record<string, any>;
}

interface AuditStats {
  totalActions: number;
  actionsByResource: Record<string, number>;
  actionsByUser: Record<string, number>;
  actionsByStatus: Record<string, number>;
  recentActivity: AuditLog[];
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const [filters, setFilters] = useState({
    userId: '',
    resourceType: '',
    action: '',
    status: '',
  });

  const [pagination, setPagination] = useState({
    limit: 50,
    offset: 0,
    total: 0,
  });

  const resourceTypes = [
    'user',
    'product',
    'order',
    'store',
    'category',
    'commission',
    'setting',
    'employee',
    'system'
  ];

  const actionTypes = [
    'CREATE',
    'UPDATE',
    'DELETE',
    'VIEW',
    'LOGIN',
    'LOGOUT',
    'APPROVE',
    'REJECT',
    'EXPORT',
    'UPLOAD',
    'DOWNLOAD'
  ];

  useEffect(() => {
    loadStats();
    loadLogs();
  }, [dateRange, filters, pagination.offset]);

  const loadStats = async () => {
    try {
      setError(null);
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);
      if (filters.userId) params.append('userId', filters.userId);

      const response = await fetch(`/api/admin/audit/stats?${params}`);
      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      } else {
        setError(result.error || 'Failed to load stats');
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      setError('Failed to load stats');
    }
  };

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.resourceType) params.append('resourceType', filters.resourceType);
      if (filters.action) params.append('action', filters.action);
      if (filters.status) params.append('status', filters.status);
      params.append('limit', pagination.limit.toString());
      params.append('offset', pagination.offset.toString());

      const response = await fetch(`/api/admin/audit/logs?${params}`);
      const result = await response.json();

      if (result.success) {
        setLogs(result.data.logs);
        setPagination(prev => ({ ...prev, total: result.data.total }));
      } else {
        setError(result.error || 'Failed to load logs');
        setLogs([]);
      }
    } catch (error) {
      console.error('Error loading logs:', error);
      setError('Failed to load logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      'success': 'bg-green-100 text-green-800',
      'failure': 'bg-red-100 text-red-800',
      'pending': 'bg-yellow-100 text-yellow-800',
    };

    const statusIcons: Record<string, React.ReactNode> = {
      'success': <CheckCircle className="h-3 w-3" />,
      'failure': <XCircle className="h-3 w-3" />,
      'pending': <Clock className="h-3 w-3" />,
    };

    return (
      <Badge variant="outline" className={statusStyles[status] || 'bg-gray-100'}>
        {statusIcons[status]}
        <span className="ml-1">{status.toUpperCase()}</span>
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const exportLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.resourceType) params.append('resourceType', filters.resourceType);
      if (filters.action) params.append('action', filters.action);
      if (filters.status) params.append('status', filters.status);

      const response = await fetch(`/api/admin/audit/logs/export?${params}`);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Audit logs exported successfully');
    } catch (error) {
      console.error('Error exporting logs:', error);
      toast.error('Failed to export logs');
    }
  };

  const handleLoadMore = () => {
    setPagination(prev => ({
      ...prev,
      offset: prev.offset + prev.limit
    }));
  };

  if (loading && logs.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Audit Logs</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
          <p className="text-gray-600">Monitor system activity and user actions</p>
        </div>
        <Button onClick={exportLogs} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Actions</p>
                  <p className="text-2xl font-bold">{stats.totalActions.toLocaleString()}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.totalActions > 0
                      ? Math.round((stats.actionsByStatus.success || 0) / stats.totalActions * 100)
                      : 0}%
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Failures</p>
                  <p className="text-2xl font-bold text-red-600">{stats.actionsByStatus.failure || 0}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.actionsByStatus.pending || 0}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              className="w-full md:w-auto"
            />

            <Input
              placeholder="Search by user email or action..."
              value={filters.userId || filters.action}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                userId: e.target.value.includes('@') ? e.target.value : '',
                action: !e.target.value.includes('@') ? e.target.value : ''
              }))}
              className="flex-1"
            />

            <Select value={filters.resourceType} onValueChange={(value) => setFilters(prev => ({ ...prev, resourceType: value }))}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Resource Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Resources</SelectItem>
                {resourceTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failure">Failure</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={loadLogs} variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs ({pagination.total.toLocaleString()})</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Logs</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={loadLogs}>Try Again</Button>
            </div>
          ) : logs.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {formatDate(log.timestamp)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{log.userName}</p>
                          <p className="text-xs text-gray-500">{log.userEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {log.resourceType.charAt(0).toUpperCase() + log.resourceType.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          {log.resourceName && (
                            <p className="text-sm font-medium truncate">{log.resourceName}</p>
                          )}
                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <p className="text-xs text-gray-500">
                              {Object.keys(log.metadata).slice(0, 2).join(', ')}
                              {Object.keys(log.metadata).length > 2 && '...'}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(log.status)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {log.ipAddress}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Audit Logs Found</h3>
              <p className="text-gray-600 mb-4">
                No activity found for the selected filters and time range.
              </p>
              <p className="text-sm text-gray-500">
                Try adjusting your filters or selecting a different time range.
              </p>
            </div>
          )}

          {/* Pagination */}
          {logs.length > 0 && pagination.offset + pagination.limit < pagination.total && (
            <div className="flex justify-center mt-6">
              <Button onClick={handleLoadMore} variant="outline">
                Load More
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}