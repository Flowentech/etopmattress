export enum EmployeeRole {
  SUPREME_ADMIN = 'supreme_admin',
  PLATFORM_ADMIN = 'platform_admin',
  STORE_MODERATOR = 'store_moderator',
  DELIVERY_MANAGER = 'delivery_manager',
  CUSTOMER_SUPPORT = 'customer_support',
  CONTENT_MODERATOR = 'content_moderator'
}

export interface EmployeePermission {
  id: string;
  name: string;
  description: string;
  category: 'stores' | 'users' | 'orders' | 'content' | 'analytics' | 'settings' | 'delivery';
}

export const EMPLOYEE_PERMISSIONS: Record<string, EmployeePermission> = {
  // Platform Admin Permissions
  'manage_all_stores': {
    id: 'manage_all_stores',
    name: 'Manage All Stores',
    description: 'Can view, edit, suspend, and delete any store',
    category: 'stores'
  },
  'approve_store_applications': {
    id: 'approve_store_applications',
    name: 'Approve Store Applications',
    description: 'Can approve or reject new store applications',
    category: 'stores'
  },
  'view_platform_analytics': {
    id: 'view_platform_analytics',
    name: 'View Platform Analytics',
    description: 'Can view platform-wide analytics and reports',
    category: 'analytics'
  },
  'manage_platform_settings': {
    id: 'manage_platform_settings',
    name: 'Manage Platform Settings',
    description: 'Can modify platform configuration and settings',
    category: 'settings'
  },

  // Store Moderator Permissions
  'moderate_store_content': {
    id: 'moderate_store_content',
    name: 'Moderate Store Content',
    description: 'Can review and moderate store content and listings',
    category: 'content'
  },
  'suspend_stores': {
    id: 'suspend_stores',
    name: 'Suspend Stores',
    description: 'Can temporarily suspend stores for violations',
    category: 'stores'
  },
  'view_store_analytics': {
    id: 'view_store_analytics',
    name: 'View Store Analytics',
    description: 'Can view analytics for assigned stores',
    category: 'analytics'
  },

  // Customer Support Permissions
  'manage_customer_tickets': {
    id: 'manage_customer_tickets',
    name: 'Manage Customer Tickets',
    description: 'Can handle customer support tickets and issues',
    category: 'users'
  },
  'process_refunds': {
    id: 'process_refunds',
    name: 'Process Refunds',
    description: 'Can process refunds and return requests',
    category: 'orders'
  },
  'view_customer_data': {
    id: 'view_customer_data',
    name: 'View Customer Data',
    description: 'Can view customer information and order history',
    category: 'users'
  },
  'communicate_with_customers': {
    id: 'communicate_with_customers',
    name: 'Communicate with Customers',
    description: 'Can send emails and messages to customers',
    category: 'users'
  },

  // Content Moderator Permissions
  'moderate_products': {
    id: 'moderate_products',
    name: 'Moderate Products',
    description: 'Can review and moderate product listings',
    category: 'content'
  },
  'moderate_reviews': {
    id: 'moderate_reviews',
    name: 'Moderate Reviews',
    description: 'Can moderate customer reviews and ratings',
    category: 'content'
  },
  'moderate_user_content': {
    id: 'moderate_user_content',
    name: 'Moderate User Content',
    description: 'Can moderate user-generated content across platform',
    category: 'content'
  },

  // Delivery Management Permissions
  'manage_all_shipments': {
    id: 'manage_all_shipments',
    name: 'Manage All Shipments',
    description: 'Can view, create, and manage shipments across all stores',
    category: 'delivery'
  },
  'create_steadfast_shipments': {
    id: 'create_steadfast_shipments',
    name: 'Create Steadfast Shipments',
    description: 'Can create shipments using Steadfast courier service',
    category: 'delivery'
  },
  'track_all_shipments': {
    id: 'track_all_shipments',
    name: 'Track All Shipments',
    description: 'Can track shipment status across all stores',
    category: 'delivery'
  },
  'manage_delivery_returns': {
    id: 'manage_delivery_returns',
    name: 'Manage Delivery Returns',
    description: 'Can handle return requests and refund processing',
    category: 'delivery'
  },
  'access_delivery_analytics': {
    id: 'access_delivery_analytics',
    name: 'Access Delivery Analytics',
    description: 'Can view delivery performance metrics and reports',
    category: 'delivery'
  },
  'configure_courier_services': {
    id: 'configure_courier_services',
    name: 'Configure Courier Services',
    description: 'Can configure courier service settings and API credentials',
    category: 'delivery'
  }
};

export const ROLE_PERMISSIONS: Record<EmployeeRole, string[]> = {
  [EmployeeRole.SUPREME_ADMIN]: Object.keys(EMPLOYEE_PERMISSIONS),
  [EmployeeRole.PLATFORM_ADMIN]: [
    'manage_all_stores',
    'approve_store_applications',
    'view_platform_analytics',
    'view_store_analytics',
    'moderate_store_content',
    'suspend_stores'
  ],
  [EmployeeRole.STORE_MODERATOR]: [
    'moderate_store_content',
    'suspend_stores',
    'view_store_analytics',
    'view_customer_data'
  ],
  [EmployeeRole.CUSTOMER_SUPPORT]: [
    'manage_customer_tickets',
    'process_refunds',
    'view_customer_data',
    'communicate_with_customers',
    'view_store_analytics'
  ],
  [EmployeeRole.CONTENT_MODERATOR]: [
    'moderate_products',
    'moderate_reviews',
    'moderate_user_content',
    'view_customer_data'
  ],
  [EmployeeRole.DELIVERY_MANAGER]: [
    'manage_all_shipments',
    'create_steadfast_shipments',
    'track_all_shipments',
    'manage_delivery_returns',
    'access_delivery_analytics',
    'view_platform_analytics',
    'view_store_analytics'
  ]
};

export interface Employee {
  _id?: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: EmployeeRole;
  customPermissions?: string[];
  department?: string;
  isActive: boolean;
  isOnline: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  employmentDetails?: {
    employeeId: string;
    hireDate: string;
    department: string;
    manager?: string;
    salary?: number;
    workSchedule: {
      workDays: string[];
      workHours: {
        start: string;
        end: string;
      };
    };
  };
  permissions?: {
    granted: string[];
    revoked: string[];
  };
}

export interface EmployeeActivity {
  _id?: string;
  employeeId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  category: 'stores' | 'users' | 'orders' | 'content' | 'analytics' | 'settings';
}

export interface EmployeeMetrics {
  employeeId: string;
  period: 'daily' | 'weekly' | 'monthly';
  metrics: {
    actionsCount: number;
    actionsByCategory: Record<string, number>;
    avgResponseTime?: number;
    ticketsResolved?: number;
    storesModerated?: number;
    contentReviewed?: number;
    customerSatisfactionScore?: number;
  };
  timestamp: string;
}

export interface PerformanceReview {
  _id?: string;
  employeeId: string;
  reviewerId: string;
  period: string;
  overallRating: number;
  categories: {
    productivity: number;
    quality: number;
    teamwork: number;
    communication: number;
    problemSolving: number;
  };
  strengths: string[];
  areasForImprovement: string[];
  goals: string[];
  feedback: string;
  status: 'draft' | 'submitted' | 'reviewed';
  createdAt: string;
  reviewedAt?: string;
}