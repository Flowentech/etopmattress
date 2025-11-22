import { headers } from 'next/headers';
import { employeeService } from './employeeService';

interface ActivityData {
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  category: 'stores' | 'users' | 'orders' | 'content' | 'analytics' | 'settings';
}

export class ActivityLogger {
  private static async getCurrentUserId(): Promise<string | null> {
    try {
      const headersList = headers();
      const clerkId = headersList.get('x-clerk-user-id');
      return clerkId || null;
    } catch {
      return null;
    }
  }

  static async logActivity(activity: ActivityData): Promise<void> {
    try {
      const clerkId = await this.getCurrentUserId();
      if (!clerkId) return;

      const employee = await employeeService.getEmployeeByClerkId(clerkId);
      if (!employee) return;

      await employeeService.logActivity({
        employeeId: employee._id!,
        ...activity,
        timestamp: new Date().toISOString(),
        ipAddress: await this.getClientIP(),
        userAgent: this.getUserAgent()
      });
    } catch (error) {
      console.error('Error logging activity:', error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  static async logStoreAction(action: string, storeId: string, details?: Record<string, any>): Promise<void> {
    await this.logActivity({
      action,
      resource: 'store',
      resourceId: storeId,
      details,
      category: 'stores'
    });
  }

  static async logUserAction(action: string, userId: string, details?: Record<string, any>): Promise<void> {
    await this.logActivity({
      action,
      resource: 'user',
      resourceId: userId,
      details,
      category: 'users'
    });
  }

  static async logOrderAction(action: string, orderId: string, details?: Record<string, any>): Promise<void> {
    await this.logActivity({
      action,
      resource: 'order',
      resourceId: orderId,
      details,
      category: 'orders'
    });
  }

  static async logContentAction(action: string, contentId: string, details?: Record<string, any>): Promise<void> {
    await this.logActivity({
      action,
      resource: 'content',
      resourceId: contentId,
      details,
      category: 'content'
    });
  }

  static async logSettingsAction(action: string, details?: Record<string, any>): Promise<void> {
    await this.logActivity({
      action,
      resource: 'settings',
      details,
      category: 'settings'
    });
  }

  static async logAnalyticsAction(action: string, details?: Record<string, any>): Promise<void> {
    await this.logActivity({
      action,
      resource: 'analytics',
      details,
      category: 'analytics'
    });
  }

  private static async getClientIP(): Promise<string> {
    try {
      const headersList = headers();
      return headersList.get('x-forwarded-for') ||
             headersList.get('x-real-ip') ||
             'unknown';
    } catch {
      return 'unknown';
    }
  }

  private static getUserAgent(): string {
    try {
      const headersList = headers();
      return headersList.get('user-agent') || 'unknown';
    } catch {
      return 'unknown';
    }
  }
}

// Higher-order function for logging activities in API routes
export function withActivityLogging<T extends any[], R>(
  activityData: ActivityData | ((...args: T) => ActivityData),
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      // Execute the main handler
      const result = await handler(...args);

      // Log the activity
      const activity = typeof activityData === 'function'
        ? activityData(...args)
        : activityData;

      await ActivityLogger.logActivity(activity);

      return result;
    } catch (error) {
      // Log error activity if provided
      if (typeof activityData === 'function') {
        try {
          const activity = activityData(...args);
          await ActivityLogger.logActivity({
            ...activity,
            action: `${activity.action}_failed`,
            details: {
              ...activity.details,
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          });
        } catch (logError) {
          console.error('Failed to log error activity:', logError);
        }
      }

      throw error;
    }
  };
}

// Predefined activity types for common actions
export const ACTIVITY_TYPES = {
  // Store activities
  STORE_CREATED: { action: 'created_store', resource: 'store', category: 'stores' as const },
  STORE_UPDATED: { action: 'updated_store', resource: 'store', category: 'stores' as const },
  STORE_SUSPENDED: { action: 'suspended_store', resource: 'store', category: 'stores' as const },
  STORE_APPROVED: { action: 'approved_store', resource: 'store', category: 'stores' as const },
  STORE_REJECTED: { action: 'rejected_store', resource: 'store', category: 'stores' as const },

  // User activities
  USER_CREATED: { action: 'created_user', resource: 'user', category: 'users' as const },
  USER_UPDATED: { action: 'updated_user', resource: 'user', category: 'users' as const },
  USER_SUSPENDED: { action: 'suspended_user', resource: 'user', category: 'users' as const },
  USER_ACTIVATED: { action: 'activated_user', resource: 'user', category: 'users' as const },

  // Order activities
  ORDER_CREATED: { action: 'created_order', resource: 'order', category: 'orders' as const },
  ORDER_UPDATED: { action: 'updated_order', resource: 'order', category: 'orders' as const },
  ORDER_CANCELLED: { action: 'cancelled_order', resource: 'order', category: 'orders' as const },
  ORDER_SHIPPED: { action: 'shipped_order', resource: 'order', category: 'orders' as const },

  // Content activities
  PRODUCT_CREATED: { action: 'created_product', resource: 'product', category: 'content' as const },
  PRODUCT_UPDATED: { action: 'updated_product', resource: 'product', category: 'content' as const },
  PRODUCT_APPROVED: { action: 'approved_product', resource: 'product', category: 'content' as const },
  PRODUCT_REJECTED: { action: 'rejected_product', resource: 'product', category: 'content' as const },

  // Review activities
  REVIEW_CREATED: { action: 'created_review', resource: 'review', category: 'content' as const },
  REVIEW_MODERATED: { action: 'moderated_review', resource: 'review', category: 'content' as const },

  // Settings activities
  SETTINGS_UPDATED: { action: 'updated_settings', resource: 'settings', category: 'settings' as const },
  PERMISSIONS_GRANTED: { action: 'granted_permissions', resource: 'permissions', category: 'settings' as const },
  PERMISSIONS_REVOKED: { action: 'revoked_permissions', resource: 'permissions', category: 'settings' as const },

  // Analytics activities
  REPORT_GENERATED: { action: 'generated_report', resource: 'report', category: 'analytics' as const },
  ANALYTICS_VIEWED: { action: 'viewed_analytics', resource: 'analytics', category: 'analytics' as const }
} as const;