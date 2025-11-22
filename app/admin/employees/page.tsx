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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Activity,
  TrendingUp,
  Calendar,
  DollarSign,
  Target,
  Award,
  Settings,
  Mail,
  Phone,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  MoreHorizontal,
  UserPlus
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import EmployeeInviteForm from '@/components/admin/EmployeeInviteForm';

interface Employee {
  _id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department?: string;
  isActive: boolean;
  isOnline: boolean;
  lastLoginAt?: string;
  createdAt: string;
  employmentDetails?: {
    employeeId: string;
    hireDate: string;
    department: string;
    workSchedule: {
      workDays: string[];
      workHours: { start: string; end: string };
    };
  };
}

interface EmployeeStatistics {
  totalEmployees: number;
  activeEmployees: number;
  onlineEmployees: number;
  recentHires: number;
  employeesByRole: Record<string, number>;
  employeesByDepartment: Record<string, number>;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [statistics, setStatistics] = useState<EmployeeStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const [newEmployee, setNewEmployee] = useState({
    clerkId: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'customer_support',
    department: '',
    employmentDetails: {
      employeeId: '',
      hireDate: '',
      department: '',
      workSchedule: {
        workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        workHours: { start: '09:00', end: '18:00' }
      }
    }
  });

  useEffect(() => {
    loadEmployees();
  }, [roleFilter, departmentFilter, statusFilter, searchTerm]);

  const loadEmployees = async () => {
    try {
      setError(null);
      setLoading(true);

      const params = new URLSearchParams();
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (departmentFilter !== 'all') params.append('department', departmentFilter);
      if (statusFilter !== 'all') params.append('isActive', String(statusFilter === 'active'));
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/admin/employees?${params}`);

      if (!response.ok) {
        const result = await response.json();
        const errorMessage = result.error?.message || result.error || `HTTP error ${response.status}`;
        console.error('API Error:', errorMessage);
        setError(errorMessage);
        setEmployees([]);
        setStatistics(null);
        return;
      }

      const result = await response.json();

      if (result.success && result.data) {
        setEmployees(result.data.employees || []);
        setStatistics(result.data.statistics || null);
      } else {
        const errorMessage = result.error?.message || 'Unknown API error';
        console.error('API Error:', errorMessage);
        setError(errorMessage);
        setEmployees([]);
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to load employees';
      console.error('Error loading employees:', error);
      setError(errorMessage);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const createEmployee = async () => {
    if (!newEmployee.clerkId || !newEmployee.email || !newEmployee.firstName || !newEmployee.lastName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/admin/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee)
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Employee created successfully');
        setCreateDialogOpen(false);
        setNewEmployee({
          clerkId: '',
          email: '',
          firstName: '',
          lastName: '',
          role: 'customer_support',
          department: '',
          employmentDetails: {
            employeeId: '',
            hireDate: '',
            department: '',
            workSchedule: {
              workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
              workHours: { start: '09:00', end: '18:00' }
            }
          }
        });
        loadEmployees();
      } else {
        const errorMessage = result.error?.message || 'Failed to create employee';
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to create employee';
      toast.error(errorMessage);
    }
  };

  const toggleEmployeeStatus = async (employeeId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/employees/${employeeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Employee ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        loadEmployees();
      } else {
        const errorMessage = result.error?.message || 'Failed to update employee';
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to update employee';
      toast.error(errorMessage);
    }
  };

  const deleteEmployee = async (employeeId: string) => {
    if (!confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/employees/${employeeId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Employee deleted successfully');
        loadEmployees();
      } else {
        const errorMessage = result.error?.message || 'Failed to delete employee';
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to delete employee';
      toast.error(errorMessage);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleStyles: Record<string, string> = {
      'supreme_admin': 'bg-red-100 text-red-800 border-red-200',
      'platform_admin': 'bg-purple-100 text-purple-800 border-purple-200',
      'store_moderator': 'bg-blue-100 text-blue-800 border-blue-200',
      'customer_support': 'bg-green-100 text-green-800 border-green-200',
      'content_moderator': 'bg-orange-100 text-orange-800 border-orange-200',
    };

    const roleNames: Record<string, string> = {
      'supreme_admin': 'Supreme Admin',
      'platform_admin': 'Platform Admin',
      'store_moderator': 'Store Moderator',
      'customer_support': 'Customer Support',
      'content_moderator': 'Content Moderator',
    };

    return (
      <Badge variant="outline" className={roleStyles[role] || 'bg-gray-100 text-gray-800'}>
        {roleNames[role] || role}
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean, isOnline: boolean) => {
    if (!isActive) {
      return <Badge variant="destructive">INACTIVE</Badge>;
    }
    if (isOnline) {
      return <Badge className="bg-green-100 text-green-800">ONLINE</Badge>;
    }
    return <Badge variant="secondary">OFFLINE</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDepartmentBadge = (department: string) => {
    const deptColors: Record<string, string> = {
      'management': 'bg-indigo-100 text-indigo-800',
      'operations': 'bg-cyan-100 text-cyan-800',
      'customer_support': 'bg-emerald-100 text-emerald-800',
      'content_moderation': 'bg-amber-100 text-amber-800',
      'technical': 'bg-rose-100 text-rose-800',
    };

    return (
      <Badge variant="outline" className={deptColors[department] || 'bg-gray-100 text-gray-800'}>
        {department?.toUpperCase() || 'UNASSIGNED'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Employee Management</h2>
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

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Employee Management</h2>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Employees</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadEmployees}>Try Again</Button>
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
          <h2 className="text-2xl font-bold text-gray-900">Employee Management</h2>
          <p className="text-gray-600">Manage your team members and their permissions</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
          <Button variant="outline" onClick={() => setInviteDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Employee
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Employees</p>
                  <p className="text-2xl font-bold">{statistics.totalEmployees}</p>
                </div>
                <Users className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.activeEmployees}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Online Now</p>
                  <p className="text-2xl font-bold text-blue-600">{statistics.onlineEmployees}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New Hires (30d)</p>
                  <p className="text-2xl font-bold text-purple-600">{statistics.recentHires}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
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
                  placeholder="Search employees by name or email..."
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
                  <SelectItem value="supreme_admin">Supreme Admin</SelectItem>
                  <SelectItem value="platform_admin">Platform Admin</SelectItem>
                  <SelectItem value="store_moderator">Store Moderator</SelectItem>
                  <SelectItem value="customer_support">Customer Support</SelectItem>
                  <SelectItem value="content_moderator">Content Moderator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="management">Management</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                  <SelectItem value="customer_support">Customer Support</SelectItem>
                  <SelectItem value="content_moderation">Content Moderation</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
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
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members ({employees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {employees.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Hire Date</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee._id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {employee.firstName[0]}{employee.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">
                              {employee.firstName} {employee.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{employee.email}</p>
                            {employee.employmentDetails?.employeeId && (
                              <p className="text-xs text-gray-400">ID: {employee.employmentDetails.employeeId}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(employee.role)}</TableCell>
                      <TableCell>
                        {getDepartmentBadge(employee.department || employee.employmentDetails?.department || 'unassigned')}
                      </TableCell>
                      <TableCell>{getStatusBadge(employee.isActive, employee.isOnline)}</TableCell>
                      <TableCell>
                        {employee.employmentDetails?.hireDate
                          ? formatDate(employee.employmentDetails.hireDate)
                          : formatDate(employee.createdAt)
                        }
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {employee.lastLoginAt
                            ? formatDate(employee.lastLoginAt)
                            : 'Never'
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedEmployee(employee);
                              setDetailsDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleEmployeeStatus(employee._id, employee.isActive)}
                          >
                            {employee.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteEmployee(employee._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Employees Yet</h3>
              <p className="text-gray-600 mb-4">Start building your team by adding your first employee.</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
                <Button variant="outline" onClick={() => setInviteDialogOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Employee
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Employee Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Create a new employee account and assign role and permissions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">First Name *</label>
                <Input
                  value={newEmployee.firstName}
                  onChange={(e) => setNewEmployee({...newEmployee, firstName: e.target.value})}
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Last Name *</label>
                <Input
                  value={newEmployee.lastName}
                  onChange={(e) => setNewEmployee({...newEmployee, lastName: e.target.value})}
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Email *</label>
                <Input
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                  placeholder="Email address"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Clerk User ID *</label>
                <Input
                  value={newEmployee.clerkId}
                  onChange={(e) => setNewEmployee({...newEmployee, clerkId: e.target.value})}
                  placeholder="Clerk user ID"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Role *</label>
                <Select
                  value={newEmployee.role}
                  onValueChange={(value) => setNewEmployee({...newEmployee, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="platform_admin">Platform Admin</SelectItem>
                    <SelectItem value="store_moderator">Store Moderator</SelectItem>
                    <SelectItem value="customer_support">Customer Support</SelectItem>
                    <SelectItem value="content_moderator">Content Moderator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Department</label>
                <Input
                  value={newEmployee.department}
                  onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                  placeholder="Department"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Employee ID</label>
              <Input
                value={newEmployee.employmentDetails.employeeId}
                onChange={(e) => setNewEmployee({
                  ...newEmployee,
                  employmentDetails: {
                    ...newEmployee.employmentDetails,
                    employeeId: e.target.value
                  }
                })}
                placeholder="EMP-001"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Hire Date</label>
              <Input
                type="date"
                value={newEmployee.employmentDetails.hireDate}
                onChange={(e) => setNewEmployee({
                  ...newEmployee,
                  employmentDetails: {
                    ...newEmployee.employmentDetails,
                    hireDate: e.target.value
                  }
                })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createEmployee}>
              Create Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Employee Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
            <DialogDescription>
              View detailed information about {selectedEmployee?.firstName} {selectedEmployee?.lastName}
            </DialogDescription>
          </DialogHeader>

          {selectedEmployee && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span>{selectedEmployee.firstName} {selectedEmployee.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span>{selectedEmployee.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Role:</span>
                      <span>{getRoleBadge(selectedEmployee.role)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span>{getStatusBadge(selectedEmployee.isActive, selectedEmployee.isOnline)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Employment Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Employee ID:</span>
                      <span>{selectedEmployee.employmentDetails?.employeeId || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hire Date:</span>
                      <span>
                        {selectedEmployee.employmentDetails?.hireDate
                          ? formatDate(selectedEmployee.employmentDetails.hireDate)
                          : 'N/A'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Department:</span>
                      <span>
                        {getDepartmentBadge(selectedEmployee.department || selectedEmployee.employmentDetails?.department || 'unassigned')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Join Date:</span>
                      <span>{formatDate(selectedEmployee.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Work Schedule */}
              {selectedEmployee.employmentDetails?.workSchedule && (
                <div>
                  <h4 className="font-semibold mb-2">Work Schedule</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Work Days:</span>
                        <div className="mt-1">
                          {selectedEmployee.employmentDetails.workSchedule.workDays.join(', ')}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Work Hours:</span>
                        <div className="mt-1">
                          {selectedEmployee.employmentDetails.workSchedule.workHours.start} -
                          {selectedEmployee.employmentDetails.workSchedule.workHours.end}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Stats */}
              <div>
                <h4 className="font-semibold mb-2">Performance Overview</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">-</div>
                    <div className="text-sm text-gray-600">Actions This Week</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">-</div>
                    <div className="text-sm text-gray-600">Tickets Resolved</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">-</div>
                    <div className="text-sm text-gray-600">Content Reviewed</div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600">-</div>
                    <div className="text-sm text-gray-600">Response Time</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Employee Invite Dialog */}
      <EmployeeInviteForm
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onSuccess={loadEmployees}
      />
    </div>
  );
}