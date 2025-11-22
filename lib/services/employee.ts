import { Employee, EmployeeRole, Permission, AccessControlRule } from '@/types/audit';
import { backendClient } from '@/sanity/lib/backendClient';
import { currentUser } from '@clerk/nextjs/server';
import { AuditService } from './audit';

export class EmployeeService {
  // Role Management
  static async createRole(data: {
    name: string;
    permissions: string[];
    description?: string;
    userId: string;
    userName: string;
    userEmail: string;
  }): Promise<EmployeeRole> {
    try {
      const role = {
        _type: 'employeeRole',
        name: data.name,
        permissions: data.permissions,
        isActive: true,
        description: data.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = await backendClient.create(role);

      // Log the action
      await AuditService.logAction({
        userId: data.userId,
        userEmail: data.userEmail,
        userName: data.userName,
        action: 'CREATE_ROLE',
        resourceType: 'employee',
        resourceId: result._id,
        resourceName: data.name,
        newValues: role,
      });

      return result;
    } catch (error) {
      console.error('Failed to create role:', error);
      throw error;
    }
  }

  static async getRoles(): Promise<EmployeeRole[]> {
    try {
      const roles = await backendClient.fetch(
        '*[_type == "employeeRole" && isActive == true] | order(name)'
      );
      return roles;
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      return [];
    }
  }

  static async updateRole(roleId: string, data: {
    name?: string;
    permissions?: string[];
    isActive?: boolean;
    description?: string;
    userId: string;
    userName: string;
    userEmail: string;
  }): Promise<EmployeeRole> {
    try {
      // Get old values for audit
      const oldRole = await backendClient.fetch(`*[_type == "employeeRole" && _id == $roleId][0]`, { roleId });

      const updatedRole = await backendClient
        .patch(roleId)
        .set({
          ...(data.name && { name: data.name }),
          ...(data.permissions && { permissions: data.permissions }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
          ...(data.description !== undefined && { description: data.description }),
          updatedAt: new Date().toISOString(),
        })
        .commit();

      // Log the action
      await AuditService.logAction({
        userId: data.userId,
        userEmail: data.userEmail,
        userName: data.userName,
        action: 'UPDATE_ROLE',
        resourceType: 'employee',
        resourceId: roleId,
        resourceName: data.name || oldRole?.name,
        oldValues: oldRole,
        newValues: data,
      });

      return updatedRole;
    } catch (error) {
      console.error('Failed to update role:', error);
      throw error;
    }
  }

  // Employee Management
  static async createEmployee(data: {
    userId: string;
    email: string;
    name: string;
    roleId: string;
    permissions?: string[];
    userId_performer: string;
    userName_performer: string;
    userEmail_performer: string;
  }): Promise<Employee> {
    try {
      const role = await backendClient.fetch(`*[_type == "employeeRole" && _id == $roleId][0]`, { roleId: data.roleId });

      const employee = {
        _type: 'employee',
        userId: data.userId,
        email: data.email,
        name: data.name,
        role: {
          _type: 'reference',
          _ref: data.roleId
        },
        permissions: data.permissions || role?.permissions || [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: data.userId_performer,
      };

      const result = await backendClient.create(employee);

      // Log the action
      await AuditService.logAction({
        userId: data.userId_performer,
        userEmail: data.userEmail_performer,
        userName: data.userName_performer,
        action: 'CREATE_EMPLOYEE',
        resourceType: 'employee',
        resourceId: result._id,
        resourceName: data.name,
        newValues: employee,
      });

      return result;
    } catch (error) {
      console.error('Failed to create employee:', error);
      throw error;
    }
  }

  static async getEmployees(): Promise<Employee[]> {
    try {
      const employees = await backendClient.fetch(`
        *[_type == "employee"] {
          ...,
          role-> {
            _id,
            name,
            permissions,
            isActive
          }
        } | order(name)
      `);
      return employees;
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      return [];
    }
  }

  static async updateEmployee(employeeId: string, data: {
    name?: string;
    roleId?: string;
    permissions?: string[];
    isActive?: boolean;
    userId_performer: string;
    userName_performer: string;
    userEmail_performer: string;
  }): Promise<Employee> {
    try {
      // Get old values for audit
      const oldEmployee = await backendClient.fetch(`
        *[_type == "employee" && _id == $employeeId][0] {
          ...,
          role-> {
            _id,
            name
          }
        }
      `, { employeeId });

      const updates: any = {
        updatedAt: new Date().toISOString(),
      };

      if (data.name) updates.name = data.name;
      if (data.roleId) updates.role = { _type: 'reference', _ref: data.roleId };
      if (data.permissions) updates.permissions = data.permissions;
      if (data.isActive !== undefined) updates.isActive = data.isActive;

      const updatedEmployee = await backendClient
        .patch(employeeId)
        .set(updates)
        .commit();

      // Log the action
      await AuditService.logAction({
        userId: data.userId_performer,
        userEmail: data.userEmail_performer,
        userName: data.userName_performer,
        action: 'UPDATE_EMPLOYEE',
        resourceType: 'employee',
        resourceId: employeeId,
        resourceName: data.name || oldEmployee?.name,
        oldValues: oldEmployee,
        newValues: data,
      });

      return updatedEmployee;
    } catch (error) {
      console.error('Failed to update employee:', error);
      throw error;
    }
  }

  static async deleteEmployee(employeeId: string, performerData: {
    userId: string;
    userName: string;
    userEmail: string;
  }): Promise<void> {
    try {
      // Get employee info for audit
      const employee = await backendClient.fetch(`*[_type == "employee" && _id == $employeeId][0]`, { employeeId });

      await backendClient.delete(employeeId);

      // Log the action
      await AuditService.logAction({
        userId: performerData.userId,
        userEmail: performerData.userEmail,
        userName: performerData.userName,
        action: 'DELETE_EMPLOYEE',
        resourceType: 'employee',
        resourceId: employeeId,
        resourceName: employee?.name,
        oldValues: employee,
        status: 'success',
      });
    } catch (error) {
      console.error('Failed to delete employee:', error);
      throw error;
    }
  }

  // Access Control
  static async hasPermission(userId: string, resource: string, action: string): Promise<boolean> {
    try {
      const employee = await backendClient.fetch(`
        *[_type == "employee" && userId == $userId && isActive == true] {
          permissions,
          role-> {
            permissions
          }
        }
      `, { userId });

      if (!employee || employee.length === 0) {
        return false;
      }

      const emp = employee[0];
      const allPermissions = [...(emp.permissions || []), ...(emp.role?.permissions || [])];

      // Check for specific permission
      const hasSpecificPermission = allPermissions.some((permission: string) =>
        permission === `${resource}.${action}` ||
        permission === `${resource}.manage` ||
        permission === `${resource}.read` && ['read', 'update'].includes(action)
      );

      return hasSpecificPermission;
    } catch (error) {
      console.error('Failed to check permission:', error);
      return false;
    }
  }

  static async getUserPermissions(userId: string): Promise<string[]> {
    try {
      const employee = await backendClient.fetch(`
        *[_type == "employee" && userId == $userId && isActive == true] {
          permissions,
          role-> {
            permissions
          }
        }
      `, { userId });

      if (!employee || employee.length === 0) {
        return [];
      }

      const emp = employee[0];
      return [...(emp.permissions || []), ...(emp.role?.permissions || [])];
    } catch (error) {
      console.error('Failed to get user permissions:', error);
      return [];
    }
  }

  // Access Control Rules
  static async createAccessRule(data: {
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
      };
    };
    expiresAt?: string;
    userId_performer: string;
    userName_performer: string;
    userEmail_performer: string;
  }): Promise<AccessControlRule> {
    try {
      const rule = {
        _type: 'accessControlRule',
        userId: data.userId,
        resource: data.resource,
        permissions: data.permissions,
        restrictions: data.restrictions,
        isActive: true,
        expiresAt: data.expiresAt,
        createdAt: new Date().toISOString(),
        createdBy: data.userId_performer,
      };

      const result = await backendClient.create(rule);

      // Log the action
      await AuditService.logAction({
        userId: data.userId_performer,
        userEmail: data.userEmail_performer,
        userName: data.userName_performer,
        action: 'CREATE_ACCESS_RULE',
        resourceType: 'system',
        resourceId: result._id,
        resourceName: `Access rule for ${data.resource}`,
        newValues: rule,
      });

      return result;
    } catch (error) {
      console.error('Failed to create access rule:', error);
      throw error;
    }
  }

  static async checkAccessRule(userId: string, resource: string, action: string): Promise<{
    hasAccess: boolean;
    reason?: string;
    rule?: AccessControlRule;
  }> {
    try {
      const rules = await backendClient.fetch(`
        *[_type == "accessControlRule" && userId == $userId && resource == $resource && isActive == true] {
          permissions,
          restrictions,
          expiresAt
        }
      `, { userId, resource });

      if (!rules || rules.length === 0) {
        // Fall back to role-based permissions
        const hasPermission = await this.hasPermission(userId, resource, action);
        return { hasAccess: hasPermission, reason: hasPermission ? 'Role-based access' : 'No access rule found' };
      }

      // Check time-based restrictions
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
      const hour = now.getHours();

      for (const rule of rules) {
        // Check if rule is expired
        if (rule.expiresAt && new Date(rule.expiresAt) < now) {
          continue;
        }

        // Check time restrictions
        if (rule.restrictions?.timeRestrictions) {
          const { startHour, endHour, daysOfWeek } = rule.restrictions.timeRestrictions;
          if (!daysOfWeek.includes(dayOfWeek) || hour < startHour || hour > endHour) {
            return { hasAccess: false, reason: 'Time-based restriction' };
          }
        }

        // Check if permission is allowed
        const hasPermission = rule.permissions.includes(action) ||
                             rule.permissions.includes('manage') ||
                             rule.permissions.includes(`${resource}.${action}`) ||
                             rule.permissions.includes(`${resource}.manage`);

        if (hasPermission) {
          return { hasAccess: true, rule };
        }
      }

      return { hasAccess: false, reason: 'Permission not granted by access rules' };
    } catch (error) {
      console.error('Failed to check access rule:', error);
      return { hasAccess: false, reason: 'Error checking access rules' };
    }
  }
}