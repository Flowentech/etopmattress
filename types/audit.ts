export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  action: string;
  resourceType: 'user' | 'product' | 'order' | 'store' | 'category' | 'commission' | 'setting' | 'employee' | 'system';
  resourceId?: string;
  resourceName?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  sessionId?: string;
  status: 'success' | 'failure' | 'pending';
  metadata?: Record<string, any>;
}

export interface EmployeeRole {
  id: string;
  name: string;
  permissions: Permission[];
  isActive: boolean;
  description?: string;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  description: string;
}

export interface Employee {
  id: string;
  userId: string;
  email: string;
  name: string;
  role: EmployeeRole;
  permissions: Permission[];
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  metadata?: Record<string, any>;
}

export interface AccessControlRule {
  id: string;
  userId: string;
  resource: string;
  permissions: string[];
  restrictions?: {
    ipAddresses?: string[];
    timeRestrictions?: {
      startHour: number;
      endHour: number;
      daysOfWeek: number[];
    };
    dataScope?: {
      stores?: string[];
      categories?: string[];
      departments?: string[];
    };
  };
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  createdBy: string;
}

export const DEFAULT_PERMISSIONS: Permission[] = [
  // User Management
  { id: 'users.read', name: 'View Users', resource: 'users', action: 'read', description: 'Can view user list and details' },
  { id: 'users.create', name: 'Create Users', resource: 'users', action: 'create', description: 'Can create new users' },
  { id: 'users.update', name: 'Update Users', resource: 'users', action: 'update', description: 'Can update user information' },
  { id: 'users.delete', name: 'Delete Users', resource: 'users', action: 'delete', description: 'Can delete users' },

  // Product Management
  { id: 'products.read', name: 'View Products', resource: 'products', action: 'read', description: 'Can view product list and details' },
  { id: 'products.create', name: 'Create Products', resource: 'products', action: 'create', description: 'Can create new products' },
  { id: 'products.update', name: 'Update Products', resource: 'products', action: 'update', description: 'Can update product information' },
  { id: 'products.delete', name: 'Delete Products', resource: 'products', action: 'delete', description: 'Can delete products' },

  // Order Management
  { id: 'orders.read', name: 'View Orders', resource: 'orders', action: 'read', description: 'Can view order list and details' },
  { id: 'orders.update', name: 'Update Orders', resource: 'orders', action: 'update', description: 'Can update order status and information' },
  { id: 'orders.manage', name: 'Manage Orders', resource: 'orders', action: 'manage', description: 'Can manage all order operations' },

  // Store Management
  { id: 'stores.read', name: 'View Stores', resource: 'stores', action: 'read', description: 'Can view store list and details' },
  { id: 'stores.create', name: 'Create Stores', resource: 'stores', action: 'create', description: 'Can create new stores' },
  { id: 'stores.update', name: 'Update Stores', resource: 'stores', action: 'update', description: 'Can update store information' },
  { id: 'stores.delete', name: 'Delete Stores', resource: 'stores', action: 'delete', description: 'Can delete stores' },
  { id: 'stores.approve', name: 'Approve Stores', resource: 'stores', action: 'manage', description: 'Can approve store applications' },

  // Analytics
  { id: 'analytics.read', name: 'View Analytics', resource: 'analytics', action: 'read', description: 'Can view analytics and reports' },
  { id: 'analytics.export', name: 'Export Analytics', resource: 'analytics', action: 'manage', description: 'Can export analytics data' },

  // Commission Management
  { id: 'commission.read', name: 'View Commission', resource: 'commission', action: 'read', description: 'Can view commission data' },
  { id: 'commission.manage', name: 'Manage Commission', resource: 'commission', action: 'manage', description: 'Can manage commission rules and payouts' },

  // Settings
  { id: 'settings.read', name: 'View Settings', resource: 'settings', action: 'read', description: 'Can view system settings' },
  { id: 'settings.update', name: 'Update Settings', resource: 'settings', action: 'update', description: 'Can update system settings' },

  // Employee Management
  { id: 'employees.read', name: 'View Employees', resource: 'employees', action: 'read', description: 'Can view employee list and details' },
  { id: 'employees.create', name: 'Create Employees', resource: 'employees', action: 'create', description: 'Can create new employees' },
  { id: 'employees.update', name: 'Update Employees', resource: 'employees', action: 'update', description: 'Can update employee information' },
  { id: 'employees.delete', name: 'Delete Employees', resource: 'employees', action: 'delete', description: 'Can delete employees' },
  { id: 'employees.manage', name: 'Manage Employees', resource: 'employees', action: 'manage', description: 'Can manage employee roles and permissions' },
];

export const DEFAULT_ROLES: Omit<EmployeeRole, 'id'>[] = [
  {
    name: 'Super Admin',
    permissions: DEFAULT_PERMISSIONS,
    isActive: true,
    description: 'Full system access with all permissions'
  },
  {
    name: 'Admin',
    permissions: DEFAULT_PERMISSIONS.filter(p => !p.id.includes('employees') && !p.id.includes('settings.update')),
    isActive: true,
    description: 'Administrative access to most features except employee management'
  },
  {
    name: 'Support Agent',
    permissions: DEFAULT_PERMISSIONS.filter(p =>
      p.resource === 'users' && p.action === 'read' ||
      p.resource === 'orders' && (p.action === 'read' || p.action === 'update') ||
      p.resource === 'products' && p.action === 'read' ||
      p.resource === 'stores' && p.action === 'read'
    ),
    isActive: true,
    description: 'Customer support access to view and manage orders'
  },
  {
    name: 'Content Manager',
    permissions: DEFAULT_PERMISSIONS.filter(p =>
      p.resource === 'products' ||
      p.resource === 'categories' && p.action !== 'delete' ||
      p.resource === 'analytics' && p.action === 'read'
    ),
    isActive: true,
    description: 'Content management for products and categories'
  },
  {
    name: 'Sales Analyst',
    permissions: DEFAULT_PERMISSIONS.filter(p =>
      p.resource === 'analytics' ||
      p.resource === 'orders' && p.action === 'read' ||
      p.resource === 'commission' && p.action === 'read'
    ),
    isActive: true,
    description: 'Analytics and sales reporting access'
  }
];