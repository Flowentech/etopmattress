import { currentUser } from '@clerk/nextjs/server';
import { client } from '@/sanity/lib/client';
import { PERMISSIONS, ROLE_PERMISSIONS } from './permissions';

interface UserRole {
  userId: string;
  userEmail: string;
  role: string;
  storeId?: string;
  permissions: string[];
  isActive: boolean;
}

// Get user roles from Sanity
export async function getUserRoles(userId: string): Promise<UserRole[]> {
  const roles = await client.fetch(`
    *[_type == "userRole" && userId == $userId && isActive == true] {
      userId,
      userEmail,
      role,
      "storeId": store._ref,
      permissions,
      isActive
    }
  `, { userId });

  return roles || [];
}

// Check if user has specific permission
export async function hasPermission(
  userId: string,
  permission: string,
  storeId?: string
): Promise<boolean> {
  const userRoles = await getUserRoles(userId);
  
  return userRoles.some(role => {
    // Check if role has the permission
    const hasRolePermission = role.permissions.includes(permission) ||
                             (ROLE_PERMISSIONS as any)[role.role]?.includes(permission);
    
    // If no store context needed, just check permission
    if (!storeId) return hasRolePermission;
    
    // If store context needed, check if user has access to that store
    return hasRolePermission && (!role.storeId || role.storeId === storeId);
  });
}

// Get stores user has access to
export async function getUserStores(userId: string): Promise<string[]> {
  const userRoles = await getUserRoles(userId);
  
  // Supreme admin has access to all stores
  if (userRoles.some(role => role.role === 'supreme_admin')) {
    const allStores = await client.fetch(`
      *[_type == "store"]._id
    `);
    return allStores;
  }
  
  // Return stores user has roles in
  return userRoles
    .filter(role => role.storeId)
    .map(role => role.storeId!);
}

// Check if user is supreme admin
export async function isSupremeAdmin(userId: string): Promise<boolean> {
  return hasPermission(userId, PERMISSIONS.PLATFORM_SETTINGS);
}

// Middleware for API routes
export async function requirePermission(permission: string, storeId?: string) {
  const user = await currentUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  const hasAccess = await hasPermission(user.id, permission, storeId);
  
  if (!hasAccess) {
    throw new Error('Forbidden');
  }
  
  return user;
}

// Create user role
export async function createUserRole(
  userId: string,
  userEmail: string,
  role: string,
  storeId?: string,
  customPermissions?: string[]
) {
  const permissions = customPermissions || ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];
  
  return await client.create({
    _type: 'userRole',
    userId,
    userEmail,
    role,
    ...(storeId && { store: { _type: 'reference', _ref: storeId } }),
    permissions,
    isActive: true,
  });
}