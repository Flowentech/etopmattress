'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  Database,
  Zap,
  TrendingUp,
  TrendingDown,
  RefreshCw
} from 'lucide-react';

interface PerformanceData {
  avgResponseTime: number;
  errorRate: number;
  cacheHitRate: number;
  totalRequests: number;
  memoryUsage?: NodeJS.MemoryUsage;
}

interface Alert {
  type: 'response_time' | 'error_rate' | 'memory_usage' | 'cache_hit_rate';
  message: string;
  currentValue: number;
  timestamp: Date;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function PerformanceMonitor() {
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    avgResponseTime: 0,
    errorRate: 0,
    cacheHitRate: 0,
    totalRequests: 0,
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h');
  const [refreshing, setRefreshing] = useState(false);

  const fetchPerformanceData = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/admin/performance/stats');
      if (response.ok) {
        const data = await response.json();
        setPerformanceData(data.performance);
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
    const interval = setInterval(fetchPerformanceData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'response_time': return 'bg-red-100 text-red-800 border-red-200';
      case 'error_rate': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'memory_usage': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cache_hit_rate': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPerformanceStatus = (value: number, type: string) => {
    const thresholds = {
      responseTime: { good: 500, warning: 2000 },
      errorRate: { good: 0.01, warning: 0.05 },
      cacheHitRate: { good: 0.9, warning: 0.7 },
    };

    const threshold = thresholds[type as keyof typeof thresholds];
    if (!threshold) return 'good';

    if (type === 'cacheHitRate') {
      if (value >= threshold.good) return 'good';
      if (value >= threshold.warning) return 'warning';
      return 'critical';
    }

    if (value <= threshold.good) return 'good';
    if (value <= threshold.warning) return 'warning';
    return 'critical';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const mockTimeSeriesData = [
    { time: '00:00', responseTime: 120, requests: 45, errors: 2 },
    { time: '04:00', responseTime: 98, requests: 32, errors: 1 },
    { time: '08:00', responseTime: 245, requests: 89, errors: 3 },
    { time: '12:00', responseTime: 189, requests: 156, errors: 4 },
    { time: '16:00', responseTime: 167, requests: 134, errors: 2 },
    { time: '20:00', responseTime: 143, requests: 98, errors: 1 },
  ];

  const mockEndpointData = [
    { endpoint: '/api/stores', requests: 456, avgTime: 145 },
    { endpoint: '/api/products', requests: 789, avgTime: 98 },
    { endpoint: '/api/orders', requests: 234, avgTime: 234 },
    { endpoint: '/api/users', requests: 123, avgTime: 67 },
    { endpoint: '/api/admin', requests: 89, avgTime: 456 },
  ];

  const mockCacheData = [
    { name: 'Cache Hits', value: performanceData.cacheHitRate * 100, color: '#00C49F' },
    { name: 'Cache Misses', value: (1 - performanceData.cacheHitRate) * 100, color: '#FF8042' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Performance Monitor</h2>
          <p className="text-gray-600">Real-time system performance and metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex bg-white rounded-lg border">
            {(['1h', '24h', '7d'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="rounded-none first:rounded-l-lg last:rounded-r-lg"
              >
                {range}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPerformanceData}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
              Active Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${getAlertColor(alert.type)}`}
                >
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">{alert.message}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className={`text-2xl font-bold ${getStatusColor(getPerformanceStatus(performanceData.avgResponseTime, 'responseTime'))}`}>
                  {performanceData.avgResponseTime}ms
                </p>
              </div>
              <Clock className={`w-8 h-8 ${getStatusColor(getPerformanceStatus(performanceData.avgResponseTime, 'responseTime'))}`} />
            </div>
            <div className="mt-2 flex items-center text-xs">
              {getPerformanceStatus(performanceData.avgResponseTime, 'responseTime') === 'good' && (
                <><TrendingDown className="w-3 h-3 text-green-500 mr-1" />Optimal</>
              )}
              {getPerformanceStatus(performanceData.avgResponseTime, 'responseTime') === 'warning' && (
                <><TrendingUp className="w-3 h-3 text-yellow-500 mr-1" />Slow</>
              )}
              {getPerformanceStatus(performanceData.avgResponseTime, 'responseTime') === 'critical' && (
                <><AlertTriangle className="w-3 h-3 text-red-500 mr-1" />Critical</>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Error Rate</p>
                <p className={`text-2xl font-bold ${getStatusColor(getPerformanceStatus(performanceData.errorRate, 'errorRate'))}`}>
                  {(performanceData.errorRate * 100).toFixed(2)}%
                </p>
              </div>
              <AlertTriangle className={`w-8 h-8 ${getStatusColor(getPerformanceStatus(performanceData.errorRate, 'errorRate'))}`} />
            </div>
            <div className="mt-2 flex items-center text-xs">
              {performanceData.errorRate === 0 && (
                <><CheckCircle className="w-3 h-3 text-green-500 mr-1" />No errors</>
              )}
              {performanceData.errorRate > 0 && performanceData.errorRate <= 0.01 && (
                <><TrendingDown className="w-3 h-3 text-yellow-500 mr-1" />Low errors</>
              )}
              {performanceData.errorRate > 0.01 && (
                <><TrendingUp className="w-3 h-3 text-red-500 mr-1" />High errors</>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cache Hit Rate</p>
                <p className={`text-2xl font-bold ${getStatusColor(getPerformanceStatus(performanceData.cacheHitRate, 'cacheHitRate'))}`}>
                  {(performanceData.cacheHitRate * 100).toFixed(1)}%
                </p>
              </div>
              <Database className={`w-8 h-8 ${getStatusColor(getPerformanceStatus(performanceData.cacheHitRate, 'cacheHitRate'))}`} />
            </div>
            <div className="mt-2 flex items-center text-xs">
              {performanceData.cacheHitRate >= 0.9 && (
                <><Zap className="w-3 h-3 text-green-500 mr-1" />Excellent</>
              )}
              {performanceData.cacheHitRate >= 0.7 && performanceData.cacheHitRate < 0.9 && (
                <><Activity className="w-3 h-3 text-yellow-500 mr-1" />Good</>
              )}
              {performanceData.cacheHitRate < 0.7 && (
                <><AlertTriangle className="w-3 h-3 text-red-500 mr-1" />Optimize</>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-blue-600">
                  {performanceData.totalRequests.toLocaleString()}
                </p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center text-xs text-gray-500">
              <Activity className="w-3 h-3 mr-1" />Last 24 hours
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="response" className="space-y-6">
        <TabsList>
          <TabsTrigger value="response">Response Time</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="cache">Cache Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="response">
          <Card>
            <CardHeader>
              <CardTitle>Response Time Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockTimeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="responseTime" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints">
          <Card>
            <CardHeader>
              <CardTitle>Endpoint Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockEndpointData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="endpoint" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="avgTime" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache">
          <Card>
            <CardHeader>
              <CardTitle>Cache Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mockCacheData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${(value as number).toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {mockCacheData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}