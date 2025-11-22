# 🔐 Role-Based Access Control (RBAC) Implementation Guide

## 🎯 **System Overview**

A comprehensive multi-tenant RBAC system for InterioWale marketplace with 5 distinct user roles and granular permissions.

### **Role Hierarchy:**
```
👑 Supreme Admin (You)
└── 🏪 Store Owner
    └── 👨‍💼 Store Manager
        ├── 📦 Employee (Inventory)
        └── 🚚 Employee (Fulfillment)
```

---

## 🏗️ **Technical Architecture**

### **1. User Roles Enum**

```typescript
export enum UserRole {
  SUPREME_ADMIN = 'supreme_admin',
  STORE_OWNER = 'store_owner',
  STORE_MANAGER = 'store_manager',
  EMPLOYEE_INVENTORY = 'employee_inventory',
  EMPLOYEE_FULFILLMENT = 'employee_fulfillment',
  CUSTOMER = 'customer'
}

export enum Permission {
  // Store Management
  CREATE_STORE = 'create_store',
  VIEW_ALL_STORES = 'view_all_stores',
  UPDATE_STORE = 'update_store',
  DELETE_STORE = 'delete_store',
  SUSPEND_STORE = 'suspend_store',
  
  // Product Management
  CREATE_PRODUCT = 'create_product',
  VIEW_PRODUCTS = 'view_products',
  UPDATE_PRODUCT = 'update_product',
  DELETE_PRODUCT = 'delete_product',
  UPDATE_INVENTORY = 'update_inventory',
  
  // Order Management
  VIEW_ORDERS = 'view_orders',
  UPDATE_ORDER_STATUS = 'update_order_status',
  PROCESS_REFUNDS = 'process_refunds',
  PRINT_LABELS = 'print_labels',
  
  // User Management
  CREATE_STORE_OWNER = 'create_store_owner',
  INVITE_EMPLOYEES = 'invite_employees',
  MANAGE_TEAM = 'manage_team',
  VIEW_ALL_USERS = 'view_all_users',
  BAN_USERS = 'ban_users',
  
  // Financial
  VIEW_EARNINGS = 'view_earnings',
  REQUEST_PAYOUT = 'request_payout',
  PROCESS_PAYOUTS = 'process_payouts',
  SET_COMMISSION_RATES = 'set_commission_rates',
  VIEW_ALL_TRANSACTIONS = 'view_all_transactions',
  
  // AI Management
  MANAGE_AI_CREDITS = 'manage_ai_credits',
  BUY_AI_CREDITS = 'buy_ai_credits',
  VIEW_AI_USAGE = 'view_ai_usage',
  SET_AI_PRICING = 'set_ai_pricing',
  
  // Analytics
  VIEW_STORE_ANALYTICS = 'view_store_analytics',
  VIEW_PLATFORM_ANALYTICS = 'view_platform_analytics',
  EXPORT_REPORTS = 'export_reports',
  
  // System
  SYSTEM_SETTINGS = 'system_settings',
  IMPERSONATE_USER = 'impersonate_user'
}
```

### **2. Role Permissions Mapping**

```typescript
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPREME_ADMIN]: [
    // All permissions - full access
    ...Object.values(Permission)
  ],
  
  [UserRole.STORE_OWNER]: [
    Permission.UPDATE_STORE,
    Permission.CREATE_PRODUCT,
    Permission.VIEW_PRODUCTS,
    Permission.UPDATE_PRODUCT,
    Permission.DELETE_PRODUCT,
    Permission.UPDATE_INVENTORY,
    Permission.VIEW_ORDERS,
    Permission.UPDATE_ORDER_STATUS,
    Permission.PROCESS_REFUNDS,
    Permission.INVITE_EMPLOYEES,
    Permission.MANAGE_TEAM,
    Permission.VIEW_EARNINGS,
    Permission.REQUEST_PAYOUT,
    Permission.BUY_AI_CREDITS,
    Permission.VIEW_AI_USAGE,
    Permission.VIEW_STORE_ANALYTICS,
    Permission.EXPORT_REPORTS
  ],
  
  [UserRole.STORE_MANAGER]: [
    Permission.CREATE_PRODUCT,
    Permission.VIEW_PRODUCTS,
    Permission.UPDATE_PRODUCT,
    Permission.UPDATE_INVENTORY,
    Permission.VIEW_ORDERS,
    Permission.UPDATE_ORDER_STATUS,
    Permission.VIEW_STORE_ANALYTICS,
    Permission.EXPORT_REPORTS
  ],
  
  [UserRole.EMPLOYEE_INVENTORY]: [
    Permission.CREATE_PRODUCT,
    Permission.VIEW_PRODUCTS,
    Permission.UPDATE_PRODUCT,
    Permission.UPDATE_INVENTORY,
    Permission.VIEW_ORDERS
  ],
  
  [UserRole.EMPLOYEE_FULFILLMENT]: [
    Permission.VIEW_PRODUCTS,
    Permission.VIEW_ORDERS,
    Permission.UPDATE_ORDER_STATUS,
    Permission.PRINT_LABELS
  ],
  
  [UserRole.CUSTOMER]: [
    Permission.BUY_AI_CREDITS
  ]
};
```

### **3. User Context Interface**

```typescript
export interface UserContext {
  userId: string;
  email: string;
  name?: string;
  roles: UserRoleContext[];
  permissions: Permission[];
  currentStoreId?: string; // Active store context
}

export interface UserRoleContext {
  id: string;
  role: UserRole;
  storeId?: string; // null for supreme admin
  storeName?: string;
  assignedAt: Date;
  assignedBy: string;
  isActive: boolean;
}
```

---

## 🔧 **Implementation Components**

### **1. RBAC Service**

```typescript
// lib/auth/rbac-service.ts
import { UserRole, Permission, ROLE_PERMISSIONS } from './types';
import { client } from '@/sanity/lib/client';

export class RBACService {
  /**
   * Get user context with roles and permissions
   */
  static async getUserContext(userId: string): Promise<UserContext> {
    const userRoles = await client.fetch(`
      *[_type == "userRole" && user._ref == $userId && isActive == true] {
        _id,
        role,
        store->{_id, name},
        assignedAt,
        assignedBy,
        isActive
      }
    `, { userId });

    const roles: UserRoleContext[] = userRoles.map((role: any) => ({
      id: role._id,
      role: role.role,
      storeId: role.store?._id,
      storeName: role.store?.name,
      assignedAt: new Date(role.assignedAt),
      assignedBy: role.assignedBy,
      isActive: role.isActive
    }));

    // Calculate permissions from all roles
    const permissions = new Set<Permission>();
    roles.forEach(roleContext => {
      const rolePermissions = ROLE_PERMISSIONS[roleContext.role] || [];
      rolePermissions.forEach(permission => permissions.add(permission));
    });

    return {
      userId,
      email: '', // Fetch from Clerk
      roles,
      permissions: Array.from(permissions),
      currentStoreId: roles[0]?.storeId // Default to first store
    };
  }

  /**
   * Check if user has specific permission
   */
  static async hasPermission(
    userId: string, 
    permission: Permission, 
    storeId?: string
  ): Promise<boolean> {
    const userContext = await this.getUserContext(userId);
    
    // Check if user has the permission
    if (!userContext.permissions.includes(permission)) {
      return false;
    }

    // For store-specific permissions, check store access
    if (storeId && !this.hasStoreAccess(userContext, storeId)) {
      return false;
    }

    return true;
  }

  /**
   * Check if user has access to specific store
   */
  static hasStoreAccess(userContext: UserContext, storeId: string): boolean {
    // Supreme admin has access to all stores
    if (userContext.roles.some(role => role.role === UserRole.SUPREME_ADMIN)) {
      return true;
    }

    // Check if user has a role in this specific store
    return userContext.roles.some(role => role.storeId === storeId);
  }

  /**
   * Get stores user has access to
   */
  static getAccessibleStores(userContext: UserContext): string[] {
    // Supreme admin sees all stores
    if (userContext.roles.some(role => role.role === UserRole.SUPREME_ADMIN)) {
      return ['*']; // Special marker for all stores
    }

    // Return specific store IDs
    return userContext.roles
      .filter(role => role.storeId)
      .map(role => role.storeId!);
  }

  /**
   * Assign role to user
   */
  static async assignRole(
    userId: string,
    role: UserRole,
    storeId?: string,
    assignedBy?: string
  ): Promise<void> {
    await client.create({
      _type: 'userRole',
      user: { _type: 'reference', _ref: userId },
      role,
      store: storeId ? { _type: 'reference', _ref: storeId } : undefined,
      assignedAt: new Date().toISOString(),
      assignedBy,
      isActive: true
    });
  }

  /**
   * Remove role from user
   */
  static async removeRole(roleId: string): Promise<void> {
    await client.patch(roleId).set({ isActive: false }).commit();
  }

  /**
   * Get role hierarchy for a user
   */
  static getRoleHierarchy(userContext: UserContext): UserRole {
    const roleHierarchy = [
      UserRole.SUPREME_ADMIN,
      UserRole.STORE_OWNER,
      UserRole.STORE_MANAGER,
      UserRole.EMPLOYEE_INVENTORY,
      UserRole.EMPLOYEE_FULFILLMENT,
      UserRole.CUSTOMER
    ];

    for (const hierarchyRole of roleHierarchy) {
      if (userContext.roles.some(role => role.role === hierarchyRole)) {
        return hierarchyRole;
      }
    }

    return UserRole.CUSTOMER;
  }
}
```

### **2. Auth Middleware**

```typescript
// middleware/auth.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { RBACService } from '@/lib/auth/rbac-service';
import { Permission } from '@/lib/auth/types';

export async function requirePermission(
  request: NextRequest,
  requiredPermission: Permission,
  storeId?: string
): Promise<NextResponse | null> {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hasPermission = await RBACService.hasPermission(
    userId,
    requiredPermission,
    storeId
  );

  if (!hasPermission) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return null; // Permission granted
}

export async function requireStoreAccess(
  request: NextRequest,
  storeId: string
): Promise<NextResponse | null> {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userContext = await RBACService.getUserContext(userId);
  
  if (!RBACService.hasStoreAccess(userContext, storeId)) {
    return NextResponse.json({ 
      error: 'Forbidden - No access to this store' 
    }, { status: 403 });
  }

  return null; // Access granted
}
```

### **3. React Hooks for RBAC**

```typescript
// hooks/useAuth.ts
import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { UserContext, Permission } from '@/lib/auth/types';

export function useUserContext(): UserContext | null {
  const { user } = useUser();
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserContext(user.id).then(context => {
        setUserContext(context);
        setLoading(false);
      });
    }
  }, [user]);

  return userContext;
}

export function usePermission(permission: Permission, storeId?: string): boolean {
  const userContext = useUserContext();
  
  if (!userContext) return false;
  
  // Check permission
  if (!userContext.permissions.includes(permission)) {
    return false;
  }

  // Check store access if required
  if (storeId && !RBACService.hasStoreAccess(userContext, storeId)) {
    return false;
  }

  return true;
}

export function useStoreAccess(storeId: string): boolean {
  const userContext = useUserContext();
  
  if (!userContext) return false;
  
  return RBACService.hasStoreAccess(userContext, storeId);
}

async function fetchUserContext(userId: string): Promise<UserContext> {
  const response = await fetch(`/api/auth/context/${userId}`);
  return response.json();
}
```

### **4. Permission Guards Components**

```typescript
// components/auth/PermissionGuard.tsx
import { usePermission } from '@/hooks/useAuth';
import { Permission } from '@/lib/auth/types';
import { ReactNode } from 'react';

interface PermissionGuardProps {
  permission: Permission;
  storeId?: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGuard({
  permission,
  storeId,
  children,
  fallback = <div>Access Denied</div>
}: PermissionGuardProps) {
  const hasPermission = usePermission(permission, storeId);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Usage Example:
<PermissionGuard permission={Permission.CREATE_PRODUCT} storeId="store123">
  <Button>Create Product</Button>
</PermissionGuard>
```

---

## 🏪 **Store Context Management**

### **Store Context Provider**

```typescript
// contexts/StoreContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';
import { UserContext } from '@/lib/auth/types';

interface StoreContextType {
  currentStoreId: string | null;
  switchStore: (storeId: string) => void;
  availableStores: Array<{ id: string; name: string }>;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ 
  children, 
  userContext 
}: { 
  children: ReactNode; 
  userContext: UserContext;
}) {
  const [currentStoreId, setCurrentStoreId] = useState(
    userContext.currentStoreId || null
  );

  const availableStores = userContext.roles
    .filter(role => role.storeId)
    .map(role => ({
      id: role.storeId!,
      name: role.storeName!
    }));

  const switchStore = (storeId: string) => {
    setCurrentStoreId(storeId);
    // Persist to localStorage or user preferences
    localStorage.setItem('currentStoreId', storeId);
  };

  return (
    <StoreContext.Provider value={{
      currentStoreId,
      switchStore,
      availableStores
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
};
```

---

## 🔐 **API Route Protection**

### **Protected API Route Example**

```typescript
// app/api/admin/stores/[storeId]/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requirePermission, requireStoreAccess } from '@/middleware/auth';
import { Permission } from '@/lib/auth/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  // Check store access
  const accessError = await requireStoreAccess(request, params.storeId);
  if (accessError) return accessError;

  // Check specific permission
  const permissionError = await requirePermission(
    request,
    Permission.VIEW_PRODUCTS,
    params.storeId
  );
  if (permissionError) return permissionError;

  // Fetch products for this store
  const products = await getProductsByStore(params.storeId);
  
  return NextResponse.json({ products });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  // Check create product permission
  const permissionError = await requirePermission(
    request,
    Permission.CREATE_PRODUCT,
    params.storeId
  );
  if (permissionError) return permissionError;

  const productData = await request.json();
  
  // Create product with store association
  const product = await createProduct({
    ...productData,
    storeId: params.storeId
  });
  
  return NextResponse.json({ product });
}
```

---

## 📊 **Dashboard Route Protection**

### **Protected Page Component**

```typescript
// app/admin/stores/[storeId]/products/page.tsx
import { auth } from '@clerk/nextjs/server';
import { RBACService } from '@/lib/auth/rbac-service';
import { Permission } from '@/lib/auth/types';
import { redirect } from 'next/navigation';
import ProductManagement from '@/components/admin/ProductManagement';

interface Props {
  params: { storeId: string };
}

export default async function StoreProductsPage({ params }: Props) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  // Check permissions
  const hasAccess = await RBACService.hasPermission(
    userId,
    Permission.VIEW_PRODUCTS,
    params.storeId
  );

  if (!hasAccess) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p>You don't have permission to view products for this store.</p>
      </div>
    );
  }

  return <ProductManagement storeId={params.storeId} />;
}
```

---

## 🧪 **Testing RBAC System**

### **Unit Tests**

```typescript
// __tests__/rbac.test.ts
import { RBACService } from '@/lib/auth/rbac-service';
import { UserRole, Permission } from '@/lib/auth/types';

describe('RBAC System', () => {
  test('Supreme admin has all permissions', async () => {
    const userContext = await RBACService.getUserContext('supreme-admin-id');
    
    expect(userContext.permissions).toContain(Permission.VIEW_ALL_STORES);
    expect(userContext.permissions).toContain(Permission.CREATE_STORE);
    expect(userContext.permissions).toContain(Permission.PROCESS_PAYOUTS);
  });

  test('Store owner cannot access other stores', async () => {
    const userContext = await RBACService.getUserContext('store-owner-id');
    
    const hasAccess = RBACService.hasStoreAccess(userContext, 'other-store-id');
    expect(hasAccess).toBe(false);
  });

  test('Employee inventory can update products', async () => {
    const hasPermission = await RBACService.hasPermission(
      'employee-id',
      Permission.UPDATE_PRODUCT,
      'their-store-id'
    );
    
    expect(hasPermission).toBe(true);
  });
});
```

---

## 🚀 **Implementation Checklist**

### **Phase 1: Core RBAC (Week 1)**
- ✅ Define roles and permissions enum
- ✅ Create RBAC service class
- ✅ Implement auth middleware
- ✅ Add user role schema to Sanity
- ✅ Create permission guard components

### **Phase 2: Store Context (Week 2)**  
- ✅ Implement store context provider
- ✅ Add store switching functionality
- ✅ Protect API routes with store access
- ✅ Create store-specific dashboards
- ✅ Test multi-store access

### **Phase 3: Advanced Features (Week 3)**
- ✅ Add role assignment UI
- ✅ Implement user invitation system
- ✅ Create audit logging
- ✅ Add permission management UI
- ✅ Performance optimization

---

This RBAC system provides enterprise-grade security with granular permissions, multi-store support, and role-based access control that scales with your marketplace growth! 🔒