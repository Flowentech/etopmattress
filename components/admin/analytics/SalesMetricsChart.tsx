'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag } from 'lucide-react';
import { StoreAnalytics } from '@/types/analytics';

interface SalesMetricsChartProps {
  data: StoreAnalytics[];
  title?: string;
  type?: 'line' | 'area' | 'bar';
  height?: number;
  className?: string;
}

export default function SalesMetricsChart({
  data,
  title = "Sales Metrics",
  type = 'area',
  height = 300,
  className,
}: SalesMetricsChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate trend
  const calculateTrend = (data: number[]) => {
    if (data.length < 2) return 0;
    const recent = data.slice(-7).reduce((a, b) => a + b, 0);
    const previous = data.slice(-14, -7).reduce((a, b) => a + b, 0);
    return previous > 0 ? ((recent - previous) / previous) * 100 : 0;
  };

  const revenueData = data.map(d => d.totalRevenue);
  const ordersData = data.map(d => d.totalOrders);
  const revenueTrend = calculateTrend(revenueData);
  const ordersTrend = calculateTrend(ordersData);

  const chartData = data.map((item) => ({
    date: formatDate(item.date),
    revenue: item.totalRevenue,
    orders: item.totalOrders,
    commission: item.commissionTotal,
    avgOrderValue: item.avgOrderValue,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('Revenue') || entry.name.includes('Commission') || entry.name.includes('Order Value')
                ? formatCurrency(entry.value)
                : entry.value.toLocaleString()
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Revenue"
            />
            <Line
              type="monotone"
              dataKey="commission"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Commission"
            />
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="revenue" fill="#2563eb" name="Revenue" />
            <Bar dataKey="commission" fill="#10b981" name="Commission" />
          </BarChart>
        );

      case 'area':
      default:
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              stackId="1"
              stroke="#2563eb"
              fill="#2563eb"
              fillOpacity={0.6}
              name="Revenue"
            />
            <Area
              type="monotone"
              dataKey="commission"
              stackId="2"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.6}
              name="Commission"
            />
          </AreaChart>
        );
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {revenueTrend >= 0 ? '+' : ''}{revenueTrend.toFixed(1)}%
              {revenueTrend >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <ShoppingBag className="h-3 w-3" />
              {ordersTrend >= 0 ? '+' : ''}{ordersTrend.toFixed(1)}%
              {ordersTrend >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}