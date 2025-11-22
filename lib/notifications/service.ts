import { emailService } from '@/lib/email/service';
import { writeClient } from '@/sanity/lib/client';
import { UserRole } from '@/types/roles';

export interface NotificationData {
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
}

export interface EmailNotificationData {
  to: string;
  type: keyof typeof emailService;
  templateParams: any;
}

class NotificationService {
  private static instance: NotificationService;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Create in-app notification
  async createNotification(data: NotificationData): Promise<{ success: boolean; error?: string }> {
    try {
      const notification = {
        _type: 'notification',
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        actionUrl: data.actionUrl,
        actionText: data.actionText,
        metadata: data.metadata,
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      await writeClient.create(notification);
      console.log(`Notification created for user ${data.userId}: ${data.title}`);

      return { success: true };
    } catch (error) {
      console.error('Failed to create notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Send email notification
  async sendEmailNotification(data: EmailNotificationData): Promise<{ success: boolean; error?: string; messageId?: string }> {
    try {
      const result = await emailService.sendTemplateEmail(data.type, data.to, data.templateParams);

      if (result.success) {
        console.log(`Email sent to ${data.to}: ${data.type}`);
      } else {
        console.error(`Failed to send email to ${data.to}: ${result.error}`);
      }

      return result;
    } catch (error) {
      console.error('Failed to send email notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Send both in-app and email notification
  async sendNotification(
    notificationData: NotificationData,
    emailData?: EmailNotificationData
  ): Promise<{ success: boolean; errors?: string[] }> {
    const errors: string[] = [];

    // Create in-app notification
    const notificationResult = await this.createNotification(notificationData);
    if (!notificationResult.success && notificationResult.error) {
      errors.push(`In-app notification: ${notificationResult.error}`);
    }

    // Send email notification if provided
    if (emailData) {
      const emailResult = await this.sendEmailNotification(emailData);
      if (!emailResult.success && emailResult.error) {
        errors.push(`Email notification: ${emailResult.error}`);
      }
    }

    return {
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  // Specific notification methods for common events

  async notifySellerApplicationReceived(sellerEmail: string, sellerId: string, storeName: string): Promise<{ success: boolean; errors?: string[] }> {
    return this.sendNotification(
      {
        userId: sellerId,
        type: 'info',
        title: 'Application Under Review',
        message: `Your store application for "${storeName}" has been received and is under review.`,
        actionUrl: '/dashboard/seller',
        actionText: 'View Dashboard',
        metadata: { storeName, applicationType: 'seller' }
      },
      {
        to: sellerEmail,
        type: 'sellerApplicationReceived',
        templateParams: storeName
      }
    );
  }

  async notifySellerApplicationApproved(sellerEmail: string, sellerId: string, storeName: string, storeUrl: string): Promise<{ success: boolean; errors?: string[] }> {
    return this.sendNotification(
      {
        userId: sellerId,
        type: 'success',
        title: 'Store Approved! 🎉',
        message: `Congratulations! Your store "${storeName}" has been approved and is now live.`,
        actionUrl: '/dashboard/seller',
        actionText: 'Go to Dashboard',
        metadata: { storeName, storeUrl, applicationType: 'seller' }
      },
      {
        to: sellerEmail,
        type: 'sellerApplicationApproved',
        templateParams: { storeName, storeUrl }
      }
    );
  }

  async notifySellerApplicationRejected(sellerEmail: string, sellerId: string, storeName: string, reason?: string): Promise<{ success: boolean; errors?: string[] }> {
    return this.sendNotification(
      {
        userId: sellerId,
        type: 'warning',
        title: 'Application Update',
        message: `Your store application for "${storeName}" was not approved. ${reason ? `Reason: ${reason}` : ''}`,
        actionUrl: '/become-seller',
        actionText: 'Reapply',
        metadata: { storeName, reason, applicationType: 'seller' }
      },
      {
        to: sellerEmail,
        type: 'sellerApplicationRejected',
        templateParams: { storeName, reason }
      }
    );
  }

  async notifyArchitectureApplicationReceived(architectEmail: string, architectId: string, firmName: string): Promise<{ success: boolean; errors?: string[] }> {
    return this.sendNotification(
      {
        userId: architectId,
        type: 'info',
        title: 'Firm Application Under Review',
        message: `Your architecture firm application for "${firmName}" has been received and is under review.`,
        actionUrl: '/dashboard/architect',
        actionText: 'View Dashboard',
        metadata: { firmName, applicationType: 'architecture' }
      },
      {
        to: architectEmail,
        type: 'architectureApplicationReceived',
        templateParams: firmName
      }
    );
  }

  async notifyArchitectureApplicationApproved(architectEmail: string, architectId: string, firmName: string, firmUrl: string): Promise<{ success: boolean; errors?: string[] }> {
    return this.sendNotification(
      {
        userId: architectId,
        type: 'success',
        title: 'Firm Approved! 🎉',
        message: `Congratulations! Your architecture firm "${firmName}" has been approved and is now live.`,
        actionUrl: '/dashboard/architect',
        actionText: 'Go to Dashboard',
        metadata: { firmName, firmUrl, applicationType: 'architecture' }
      },
      {
        to: architectEmail,
        type: 'architectureApplicationApproved',
        templateParams: { firmName, firmUrl }
      }
    );
  }

  async notifyNewOrder(sellerEmail: string, sellerId: string, orderNumber: string, customerName: string, total: number): Promise<{ success: boolean; errors?: string[] }> {
    return this.sendNotification(
      {
        userId: sellerId,
        type: 'success',
        title: 'New Order Received! 🛒',
        message: `You've received a new order #${orderNumber} from ${customerName} for ৳${total.toLocaleString()}.`,
        actionUrl: '/dashboard/seller?tab=orders',
        actionText: 'View Order',
        metadata: { orderNumber, customerName, total }
      },
      {
        to: sellerEmail,
        type: 'newOrder',
        templateParams: { orderNumber, customerName, total }
      }
    );
  }

  async notifyNewProjectProposal(architectEmail: string, architectId: string, projectTitle: string, clientName: string): Promise<{ success: boolean; errors?: string[] }> {
    return this.sendNotification(
      {
        userId: architectId,
        type: 'info',
        title: 'New Project Available 🏗️',
        message: `A new project "${projectTitle}" from ${clientName} is available for proposal.`,
        actionUrl: '/architecture/projects',
        actionText: 'View Projects',
        metadata: { projectTitle, clientName }
      },
      {
        to: architectEmail,
        type: 'newProjectProposal',
        templateParams: { projectTitle, clientName }
      }
    );
  }

  // Get user notifications
  async getUserNotifications(userId: string, limit: number = 10): Promise<any[]> {
    try {
      const notifications = await writeClient.fetch(`
        *[_type == "notification" && userId == $userId] | order(createdAt desc) [0...$limit] {
          _id,
          type,
          title,
          message,
          actionUrl,
          actionText,
          isRead,
          createdAt,
          metadata
        }
      `, { userId, limit });

      return notifications;
    } catch (error) {
      console.error('Failed to fetch user notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await writeClient.patch(notificationId).set({ isRead: true }).commit();
      return { success: true };
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Mark all notifications as read for a user
  async markAllNotificationsAsRead(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const notifications = await writeClient.fetch(`
        *[_type == "notification" && userId == $userId && isRead == false]._id
      `, { userId });

      if (notifications.length > 0) {
        await writeClient
          .patch(notifications)
          .set({ isRead: true })
          .commit();
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();