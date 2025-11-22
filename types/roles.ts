export enum UserRole {
  CUSTOMER = 'customer',
  SELLER = 'seller',
  ARCHITECT = 'architect',
  ARCHITECT_CLIENT = 'architect_client',
  CUSTOMER_ARCHITECT_CLIENT = 'customer_architect_client', // User can do both
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export interface UserProfile {
  id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  storeId?: string;
  architectureFirmId?: string;
  isActive: boolean;
  isVerified: boolean;
  preferences: {
    enableShopping: boolean;
    enableArchitectureServices: boolean;
    defaultDashboard?: 'shopping' | 'architecture';
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRolePermissions {
  canManageStore: boolean;
  canManageArchitectureFirm: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canManageOrders: boolean;
  canManageProducts: boolean;
  canManageServices: boolean;
  canViewAllStores: boolean;
  canViewAllArchitectureFirms: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, UserRolePermissions> = {
  [UserRole.CUSTOMER]: {
    canManageStore: false,
    canManageArchitectureFirm: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canManageOrders: true,
    canManageProducts: false,
    canManageServices: false,
    canViewAllStores: false,
    canViewAllArchitectureFirms: false,
  },
  [UserRole.SELLER]: {
    canManageStore: true,
    canManageArchitectureFirm: false,
    canManageUsers: false,
    canViewAnalytics: true,
    canManageOrders: true,
    canManageProducts: true,
    canManageServices: false,
    canViewAllStores: false,
    canViewAllArchitectureFirms: false,
  },
  [UserRole.ARCHITECT]: {
    canManageStore: false,
    canManageArchitectureFirm: true,
    canManageUsers: false,
    canViewAnalytics: true,
    canManageOrders: false,
    canManageProducts: false,
    canManageServices: true,
    canViewAllStores: false,
    canViewAllArchitectureFirms: false,
  },
  [UserRole.ARCHITECT_CLIENT]: {
    canManageStore: false,
    canManageArchitectureFirm: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canManageOrders: true,
    canManageProducts: false,
    canManageServices: false,
    canViewAllStores: false,
    canViewAllArchitectureFirms: false,
  },
  [UserRole.CUSTOMER_ARCHITECT_CLIENT]: {
    canManageStore: false,
    canManageArchitectureFirm: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canManageOrders: true,
    canManageProducts: false,
    canManageServices: false,
    canViewAllStores: false,
    canViewAllArchitectureFirms: false,
  },
  [UserRole.ADMIN]: {
    canManageStore: true,
    canManageArchitectureFirm: true,
    canManageUsers: true,
    canViewAnalytics: true,
    canManageOrders: true,
    canManageProducts: true,
    canManageServices: true,
    canViewAllStores: true,
    canViewAllArchitectureFirms: true,
  },
  [UserRole.SUPER_ADMIN]: {
    canManageStore: true,
    canManageArchitectureFirm: true,
    canManageUsers: true,
    canViewAnalytics: true,
    canManageOrders: true,
    canManageProducts: true,
    canManageServices: true,
    canViewAllStores: true,
    canViewAllArchitectureFirms: true,
  },
};

export function getPermissions(role: UserRole): UserRolePermissions {
  return ROLE_PERMISSIONS[role];
}

export function hasPermission(
  userRole: UserRole,
  permission: keyof UserRolePermissions
): boolean {
  return getPermissions(userRole)[permission];
}