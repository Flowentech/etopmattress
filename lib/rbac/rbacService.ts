import { client } from '@/sanity/lib/client';
import { ROLE_PERMISSIONS, PERMISSIONS, ROLES } from './permissions';

export type Role = keyof typeof ROLE_PERMISSIONS;
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export interface UserContext {
  userId: string;
  role: Role;
  storeId?: string;
  customPermissions?: Permission[];
}

export class RBACService {
  async getUserContext(userId: string): Promise<UserContext | null> {
    try {
      // Get user role from Sanity
      const userRole = await client.fetch(`
        *[_type == "userRole" && userId == $userId][0] {
          userId,
          role,
          "storeId": store._ref,
          permissions,
          isActive
        }
      `, { userId });

      if (!userRole) {
        return {
          userId,
          role: 'customer',
          customPermissions: []
        };
      }

      return {
        userId: userRole.userId,
        role: userRole.role,
        storeId: userRole.storeId,
        customPermissions: userRole.permissions || []
      };
    } catch (error) {
      console.error('Error fetching user context:', error);
      return null;
    }
  }

  hasPermission(userContext: UserContext, permission: Permission): boolean {
    // Check custom permissions first
    if (userContext.customPermissions?.includes(permission)) {
      return true;
    }

    // Check role-based permissions
    const rolePermissions = (ROLE_PERMISSIONS as any)[userContext.role] || [];
    return rolePermissions.includes(permission);
  }

  hasAnyPermission(userContext: UserContext, permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(userContext, permission));
  }

  hasAllPermissions(userContext: UserContext, permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(userContext, permission));
  }

  async getUserStoreAccess(userId: string): Promise<string[]> {
    try {
      const userRoles = await client.fetch(`
        *[_type == "userRole" && userId == $userId] {
          role,
          "storeId": store._ref
        }
      `, { userId });

      // Supreme admin has access to all stores
      if (userRoles.some((role: any) => role.role === 'supreme_admin')) {
        const allStores = await client.fetch(`
          *[_type == "store"]._id
        `);
        return allStores;
      }

      // Return only stores this user has access to
      return userRoles
        .filter((role: any) => role.storeId)
        .map((role: any) => role.storeId);
    } catch (error) {
      console.error('Error fetching user store access:', error);
      return [];
    }
  }

  async assignRole(userId: string, role: Role, storeId?: string, customPermissions?: Permission[]): Promise<boolean> {
    try {
      const roleData: any = {
        _type: 'userRole',
        userId,
        userEmail: '', // You might want to get this from Clerk
        role,
        permissions: customPermissions || [],
        isActive: true
      };

      if (storeId) {
        roleData.store = {
          _type: 'reference',
          _ref: storeId
        };
      }

      await client.create(roleData);
      return true;
    } catch (error) {
      console.error('Error assigning role:', error);
      return false;
    }
  }

  async updateRole(userId: string, role: Role, storeId?: string, customPermissions?: Permission[]): Promise<boolean> {
    try {
      const query = storeId 
        ? `*[_type == "userRole" && userId == $userId && store._ref == $storeId][0]._id`
        : `*[_type == "userRole" && userId == $userId && !defined(store)][0]._id`;
      
      const existingRoleId = await client.fetch(query, { userId, storeId });

      if (!existingRoleId) {
        return this.assignRole(userId, role, storeId, customPermissions);
      }

      const updateData: any = {
        role,
        permissions: customPermissions || []
      };

      if (storeId) {
        updateData.store = {
          _type: 'reference',
          _ref: storeId
        };
      }

      await client.patch(existingRoleId).set(updateData).commit();
      return true;
    } catch (error) {
      console.error('Error updating role:', error);
      return false;
    }
  }

  async revokeRole(userId: string, storeId?: string): Promise<boolean> {
    try {
      const query = storeId 
        ? `*[_type == "userRole" && userId == $userId && store._ref == $storeId]`
        : `*[_type == "userRole" && userId == $userId && !defined(store)]`;

      const rolesToDelete = await client.fetch(query, { userId, storeId });
      
      for (const role of rolesToDelete) {
        await client.delete(role._id);
      }

      return true;
    } catch (error) {
      console.error('Error revoking role:', error);
      return false;
    }
  }

  async enforceStoreAccess(userId: string, requestedStoreId?: string): Promise<string[]> {
    const accessibleStores = await this.getUserStoreAccess(userId);
    
    if (requestedStoreId) {
      if (!accessibleStores.includes(requestedStoreId)) {
        throw new Error('Access denied: You do not have permission to access this store');
      }
      return [requestedStoreId];
    }

    return accessibleStores;
  }

  isSupremeAdmin(userContext: UserContext): boolean {
    return userContext.role === 'supreme_admin';
  }

  isStoreOwner(userContext: UserContext, storeId?: string): boolean {
    return userContext.role === 'store_owner' && 
           (!storeId || userContext.storeId === storeId);
  }

  canAccessStore(userContext: UserContext, storeId: string): boolean {
    if (this.isSupremeAdmin(userContext)) {
      return true;
    }
    
    return userContext.storeId === storeId;
  }
}

export const rbacService = new RBACService();