import { AuditLog } from '@/types/audit';
import { backendClient } from '@/sanity/lib/backendClient';
import { headers } from 'next/headers';

export class AuditService {
  static async logAction(data: {
    userId: string;
    userEmail: string;
    userName: string;
    action: string;
    resourceType: AuditLog['resourceType'];
    resourceId?: string;
    resourceName?: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    status?: 'success' | 'failure' | 'pending';
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      const headersList = headers();
      const ipAddress = headersList.get('x-forwarded-for') ||
                        headersList.get('x-real-ip') ||
                        headersList.get('x-client-ip') ||
                        'unknown';

      const userAgent = headersList.get('user-agent') || 'unknown';

      const auditLog: Omit<AuditLog, 'id'> = {
        userId: data.userId,
        userEmail: data.userEmail,
        userName: data.userName,
        action: data.action,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        resourceName: data.resourceName,
        oldValues: data.oldValues,
        newValues: data.newValues,
        ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
        userAgent,
        timestamp: new Date().toISOString(),
        status: data.status || 'success',
        metadata: data.metadata,
      };

      // Store in Sanity CMS
      const result = await backendClient.create({
        _type: 'auditLog',
        ...auditLog,
      });

      console.log('Audit log created:', result._id);
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Don't throw error to avoid breaking the main operation
    }
  }

  static async getAuditLogs(filters: {
    userId?: string;
    resourceType?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: AuditLog[]; total: number }> {
    try {
      let query = '*[_type == "auditLog"';
      const params: any = {};

      if (filters.userId) {
        query += ' && userId == $userId';
        params.userId = filters.userId;
      }

      if (filters.resourceType) {
        query += ' && resourceType == $resourceType';
        params.resourceType = filters.resourceType;
      }

      if (filters.action) {
        query += ' && action match $action';
        params.action = `*${filters.action}*`;
      }

      if (filters.startDate) {
        query += ' && timestamp >= $startDate';
        params.startDate = filters.startDate;
      }

      if (filters.endDate) {
        query += ' && timestamp <= $endDate';
        params.endDate = filters.endDate;
      }

      query += '] | order(timestamp desc)';

      if (filters.limit) {
        query += `[${filters.offset || 0}...${filters.offset + filters.limit}]`;
      }

      const logs = await backendClient.fetch(query, params);

      // Get total count
      let countQuery = '*[_type == "auditLog"';
      if (filters.userId) countQuery += ' && userId == $userId';
      if (filters.resourceType) countQuery += ' && resourceType == $resourceType';
      if (filters.action) countQuery += ' && action match $action';
      if (filters.startDate) countQuery += ' && timestamp >= $startDate';
      if (filters.endDate) countQuery += ' && timestamp <= $endDate';
      countQuery += ']';

      const total = await backendClient.fetch(`count(${countQuery})`, params);

      return { logs, total };
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      return { logs: [], total: 0 };
    }
  }

  static async getAuditLogStats(filters: {
    startDate?: string;
    endDate?: string;
    userId?: string;
  }): Promise<{
    totalActions: number;
    actionsByResource: Record<string, number>;
    actionsByUser: Record<string, number>;
    actionsByStatus: Record<string, number>;
    recentActivity: AuditLog[];
  }> {
    try {
      const baseQuery = '*[_type == "auditLog"';
      const params: any = {};

      if (filters.userId) {
        baseQuery += ' && userId == $userId';
        params.userId = filters.userId;
      }

      if (filters.startDate) {
        baseQuery += ' && timestamp >= $startDate';
        params.startDate = filters.startDate;
      }

      if (filters.endDate) {
        baseQuery += ' && timestamp <= $endDate';
        params.endDate = filters.endDate;
      }

      baseQuery += ']';

      // Get recent activity
      const recentActivity = await backendClient.fetch(
        `${baseQuery} | order(timestamp desc) [0...9]`,
        params
      );

      // Get stats
      const stats = await backendClient.fetch(
        `${baseQuery} {
          resourceType,
          userId,
          status
        }`,
        params
      );

      const actionsByResource = stats.reduce((acc: any, log: any) => {
        acc[log.resourceType] = (acc[log.resourceType] || 0) + 1;
        return acc;
      }, {});

      const actionsByUser = stats.reduce((acc: any, log: any) => {
        acc[log.userId] = (acc[log.userId] || 0) + 1;
        return acc;
      }, {});

      const actionsByStatus = stats.reduce((acc: any, log: any) => {
        acc[log.status] = (acc[log.status] || 0) + 1;
        return acc;
      }, {});

      return {
        totalActions: stats.length,
        actionsByResource,
        actionsByUser,
        actionsByStatus,
        recentActivity,
      };
    } catch (error) {
      console.error('Failed to fetch audit log stats:', error);
      return {
        totalActions: 0,
        actionsByResource: {},
        actionsByUser: {},
        actionsByStatus: {},
        recentActivity: [],
      };
    }
  }
}

// Helper function to get client information
export function getClientInfo() {
  const headersList = headers();
  return {
    ipAddress: headersList.get('x-forwarded-for') ||
               headersList.get('x-real-ip') ||
               headersList.get('x-client-ip') ||
               'unknown',
    userAgent: headersList.get('user-agent') || 'unknown',
  };
}

// React hook for audit logging
export function useAuditLogger() {
  return {
    logAction: async (data: {
      action: string;
      resourceType: AuditLog['resourceType'];
      resourceId?: string;
      resourceName?: string;
      oldValues?: Record<string, any>;
      newValues?: Record<string, any>;
      status?: 'success' | 'failure' | 'pending';
      metadata?: Record<string, any>;
    }) => {
      // This would need to be called from a client component
      // We'll need to pass user info from the context
      console.warn('useAuditLogger should be used with user context');
    }
  };
}