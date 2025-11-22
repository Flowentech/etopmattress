import { client } from '@/sanity/lib/client';
import { Employee, EmployeeRole, EmployeeActivity, EmployeeMetrics, PerformanceReview, ROLE_PERMISSIONS, EMPLOYEE_PERMISSIONS } from '@/types/employee';

export class EmployeeService {
  // Employee Management
  async createEmployee(employeeData: Omit<Employee, '_id' | 'createdAt' | 'updatedAt'>): Promise<Employee> {
    try {
      const newEmployee = {
        ...employeeData,
        _type: 'employee',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = await client.create(newEmployee);
      return result;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw new Error('Failed to create employee');
    }
  }

  async getEmployees(filters?: {
    role?: EmployeeRole;
    department?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<Employee[]> {
    try {
      let query = `*[_type == "employee"`;

      if (filters) {
        const conditions = [];
        if (filters.role) conditions.push(`role == "${filters.role}"`);
        if (filters.department) conditions.push(`department == "${filters.department}"`);
        if (filters.isActive !== undefined) conditions.push(`isActive == ${filters.isActive}`);
        if (filters.search) {
          conditions.push(`(firstName match "*${filters.search}*" || lastName match "*${filters.search}*" || email match "*${filters.search}*")`);
        }
        if (conditions.length > 0) {
          query += ` && ${conditions.join(' && ')}`;
        }
      }

      query += `] | order(createdAt desc)`;

      const employees = await client.fetch(query);
      return employees;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw new Error('Failed to fetch employees');
    }
  }

  async getEmployeeById(id: string): Promise<Employee | null> {
    try {
      const employee = await client.fetch(`*[_type == "employee" && _id == $id][0]`, { id });
      return employee;
    } catch (error) {
      console.error('Error fetching employee:', error);
      return null;
    }
  }

  async getEmployeeByClerkId(clerkId: string): Promise<Employee | null> {
    try {
      const employee = await client.fetch(`*[_type == "employee" && clerkId == $clerkId][0]`, { clerkId });
      return employee;
    } catch (error) {
      console.error('Error fetching employee by Clerk ID:', error);
      return null;
    }
  }

  async updateEmployee(id: string, updateData: Partial<Employee>): Promise<Employee> {
    try {
      const updatedEmployee = await client
        .patch(id)
        .set({
          ...updateData,
          updatedAt: new Date().toISOString(),
        })
        .commit();
      return updatedEmployee;
    } catch (error) {
      console.error('Error updating employee:', error);
      throw new Error('Failed to update employee');
    }
  }

  async deleteEmployee(id: string): Promise<void> {
    try {
      await client.delete(id);
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw new Error('Failed to delete employee');
    }
  }

  async activateEmployee(id: string): Promise<Employee> {
    return this.updateEmployee(id, { isActive: true });
  }

  async deactivateEmployee(id: string): Promise<Employee> {
    return this.updateEmployee(id, { isActive: false });
  }

  // Permission Management
  async assignPermissions(employeeId: string, permissions: string[]): Promise<Employee> {
    return this.updateEmployee(employeeId, {
      customPermissions: permissions,
      permissions: {
        granted: permissions,
        revoked: []
      }
    });
  }

  async grantPermission(employeeId: string, permission: string): Promise<Employee> {
    const employee = await this.getEmployeeById(employeeId);
    if (!employee) throw new Error('Employee not found');

    const currentPermissions = employee.customPermissions || [];
    const newPermissions = [...new Set([...currentPermissions, permission])];

    return this.updateEmployee(employeeId, {
      customPermissions: newPermissions,
      permissions: {
        ...employee.permissions,
        granted: [...(employee.permissions?.granted || []), permission]
      }
    });
  }

  async revokePermission(employeeId: string, permission: string): Promise<Employee> {
    const employee = await this.getEmployeeById(employeeId);
    if (!employee) throw new Error('Employee not found');

    const currentPermissions = employee.customPermissions || [];
    const newPermissions = currentPermissions.filter(p => p !== permission);

    return this.updateEmployee(employeeId, {
      customPermissions: newPermissions,
      permissions: {
        ...employee.permissions,
        revoked: [...(employee.permissions?.revoked || []), permission]
      }
    });
  }

  hasPermission(employee: Employee, permission: string): boolean {
    // Check if permission is revoked
    if (employee.permissions?.revoked.includes(permission)) {
      return false;
    }

    // Check if permission is granted
    if (employee.permissions?.granted.includes(permission) || employee.customPermissions?.includes(permission)) {
      return true;
    }

    // Check role-based permissions
    const rolePermissions = ROLE_PERMISSIONS[employee.role] || [];
    return rolePermissions.includes(permission);
  }

  // Activity Tracking
  async logActivity(activity: Omit<EmployeeActivity, '_id'>): Promise<void> {
    try {
      await client.create({
        ...activity,
        _type: 'employeeActivity',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  async getEmployeeActivity(employeeId: string, limit: number = 50): Promise<EmployeeActivity[]> {
    try {
      const activities = await client.fetch(`
        *[_type == "employeeActivity" && employee._ref == $employeeId]
        | order(timestamp desc)
        [0...$limit]
      `, { employeeId, limit });
      return activities;
    } catch (error) {
      console.error('Error fetching employee activity:', error);
      return [];
    }
  }

  async getAllActivities(limit: number = 100): Promise<EmployeeActivity[]> {
    try {
      const activities = await client.fetch(`
        *[_type == "employeeActivity"]
        | order(timestamp desc)
        [0...$limit]
      `, { limit });
      return activities;
    } catch (error) {
      console.error('Error fetching activities:', error);
      return [];
    }
  }

  // Performance Metrics
  async getEmployeeMetrics(employeeId: string, period: 'daily' | 'weekly' | 'monthly'): Promise<EmployeeMetrics | null> {
    try {
      // Calculate metrics from activities
      const endDate = new Date();
      const startDate = new Date();

      switch (period) {
        case 'daily':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case 'weekly':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'monthly':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
      }

      const activities = await client.fetch(`
        *[_type == "employeeActivity" && employee._ref == $employeeId && timestamp >= $startDate && timestamp <= $endDate]
      `, { employeeId, startDate: startDate.toISOString(), endDate: endDate.toISOString() });

      const metrics: EmployeeMetrics = {
        employeeId,
        period,
        timestamp: new Date().toISOString(),
        metrics: {
          actionsCount: activities.length,
          actionsByCategory: this.categorizeActivities(activities),
          avgResponseTime: this.calculateAvgResponseTime(activities),
          ticketsResolved: this.countTicketsResolved(activities),
          storesModerated: this.countStoresModerated(activities),
          contentReviewed: this.countContentReviewed(activities),
          customerSatisfactionScore: 0 // Would need customer feedback data
        }
      };

      return metrics;
    } catch (error) {
      console.error('Error fetching employee metrics:', error);
      return null;
    }
  }

  // Performance Reviews
  async createPerformanceReview(reviewData: Omit<PerformanceReview, '_id'>): Promise<PerformanceReview> {
    try {
      const review = {
        ...reviewData,
        _type: 'performanceReview',
      };

      const result = await client.create(review);
      return result;
    } catch (error) {
      console.error('Error creating performance review:', error);
      throw new Error('Failed to create performance review');
    }
  }

  async getEmployeeReviews(employeeId: string): Promise<PerformanceReview[]> {
    try {
      const reviews = await client.fetch(`
        *[_type == "performanceReview" && employee._ref == $employeeId]
        | order(createdAt desc)
      `, { employeeId });
      return reviews;
    } catch (error) {
      console.error('Error fetching performance reviews:', error);
      return [];
    }
  }

  // Helper methods
  private categorizeActivities(activities: EmployeeActivity[]): Record<string, number> {
    const categories: Record<string, number> = {};
    activities.forEach(activity => {
      categories[activity.category] = (categories[activity.category] || 0) + 1;
    });
    return categories;
  }

  private calculateAvgResponseTime(activities: EmployeeActivity[]): number {
    // Calculate average response time from customer support activities
    const supportActivities = activities.filter(a => a.category === 'users' && a.action.includes('respond'));
    if (supportActivities.length === 0) return 0;

    // This would need more detailed timestamp data for accurate calculation
    return 30; // Placeholder: 30 minutes average
  }

  private countTicketsResolved(activities: EmployeeActivity[]): number {
    return activities.filter(a =>
      a.category === 'users' &&
      (a.action.includes('resolved') || a.action.includes('closed'))
    ).length;
  }

  private countStoresModerated(activities: EmployeeActivity[]): number {
    return activities.filter(a =>
      a.category === 'stores' &&
      (a.action.includes('suspended') || a.action.includes('approved') || a.action.includes('moderated'))
    ).length;
  }

  private countContentReviewed(activities: EmployeeActivity[]): number {
    return activities.filter(a =>
      a.category === 'content' &&
      (a.action.includes('reviewed') || a.action.includes('moderated') || a.action.includes('approved'))
    ).length;
  }

  // Statistics
  async getEmployeeStatistics(): Promise<{
    totalEmployees: number;
    activeEmployees: number;
    employeesByRole: Record<string, number>;
    employeesByDepartment: Record<string, number>;
    onlineEmployees: number;
    recentHires: number;
  }> {
    try {
      const employees = await this.getEmployees();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const stats = {
        totalEmployees: employees.length,
        activeEmployees: employees.filter(e => e.isActive).length,
        onlineEmployees: employees.filter(e => e.isOnline).length,
        recentHires: employees.filter(e =>
          new Date(e.employmentDetails?.hireDate || e.createdAt) > thirtyDaysAgo
        ).length,
        employeesByRole: employees.reduce((acc, emp) => {
          acc[emp.role] = (acc[emp.role] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        employeesByDepartment: employees.reduce((acc, emp) => {
          const dept = emp.department || emp.employmentDetails?.department || 'unassigned';
          acc[dept] = (acc[dept] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };

      return stats;
    } catch (error) {
      console.error('Error fetching employee statistics:', error);
      throw new Error('Failed to fetch employee statistics');
    }
  }
}

export const employeeService = new EmployeeService();