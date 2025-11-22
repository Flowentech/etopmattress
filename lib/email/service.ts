import { emailTemplates, EmailTemplate } from './templates';

export interface EmailConfig {
  to: string | string[];
  subject?: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export type EmailType = keyof typeof emailTemplates;

export class EmailService {
  private static instance: EmailService;
  private apiKey: string;
  private baseUrl: string;
  private fromEmail: string;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY || '';
    this.baseUrl = 'https://api.resend.com';
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@interiowale.com';

    if (!this.apiKey) {
      console.warn('RESEND_API_KEY not found in environment variables. Email service will be disabled.');
    }
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private async sendEmail(config: EmailConfig): Promise<{ success: boolean; error?: string; messageId?: string }> {
    if (!this.apiKey) {
      console.warn('Email service disabled - no API key provided');
      return { success: false, error: 'Email service disabled' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/emails`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: config.from || this.fromEmail,
          to: Array.isArray(config.to) ? config.to : [config.to],
          subject: config.subject,
          html: config.html,
          text: config.text,
          replyTo: config.replyTo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Email service error:', data);
        return {
          success: false,
          error: data.message || 'Failed to send email'
        };
      }

      console.log('Email sent successfully:', data.id);
      return {
        success: true,
        messageId: data.id
      };

    } catch (error) {
      console.error('Failed to send email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async sendTemplateEmail<T extends EmailType>(
    type: T,
    to: string | string[],
    templateParams: Parameters<typeof emailTemplates[T]>[0]
  ): Promise<{ success: boolean; error?: string; messageId?: string }> {
    try {
      // Get the template function
      const templateFunction = emailTemplates[type];
      if (!templateFunction) {
        return { success: false, error: `Email template "${type}" not found` };
      }

      // Generate email content
      const template = templateFunction(templateParams as any);

      // Send the email
      return await this.sendEmail({
        to,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

    } catch (error) {
      console.error(`Failed to send template email "${type}":`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Convenience methods for common email types
  async sendSellerApplicationReceived(to: string, storeName: string) {
    return this.sendTemplateEmail('sellerApplicationReceived', to, storeName);
  }

  async sendSellerApplicationApproved(to: string, storeName: string, storeUrl: string) {
    return this.sendTemplateEmail('sellerApplicationApproved', to, { storeName, storeUrl });
  }

  async sendSellerApplicationRejected(to: string, storeName: string, reason?: string) {
    return this.sendTemplateEmail('sellerApplicationRejected', to, { storeName, reason });
  }

  async sendArchitectureApplicationReceived(to: string, firmName: string) {
    return this.sendTemplateEmail('architectureApplicationReceived', to, firmName);
  }

  async sendArchitectureApplicationApproved(to: string, firmName: string, firmUrl: string) {
    return this.sendTemplateEmail('architectureApplicationApproved', to, { firmName, firmUrl });
  }

  async sendNewOrder(to: string, orderNumber: string, customerName: string, total: number) {
    return this.sendTemplateEmail('newOrder', to, { orderNumber, customerName, total });
  }

  async sendNewProjectProposal(to: string, projectTitle: string, clientName: string) {
    return this.sendTemplateEmail('newProjectProposal', to, { projectTitle, clientName });
  }

  // Custom email method for one-off emails
  async sendCustomEmail(config: EmailConfig) {
    return this.sendEmail(config);
  }

  // Test method to verify email service is working
  async testEmail(to: string): Promise<{ success: boolean; error?: string; messageId?: string }> {
    return this.sendEmail({
      to,
      subject: 'Test Email from InterioWale',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Test Email</h1>
          </div>
          <div style="padding: 30px; background-color: #f9fafb;">
            <p>This is a test email from InterioWale to verify that the email service is working correctly.</p>
            <p>If you received this email, the service is functioning properly!</p>
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              Sent at: ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `,
      text: 'This is a test email from InterioWale. If you received this, the email service is working correctly.',
    });
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance();

// Export a simple function for quick email sending
export const sendEmail = (config: EmailConfig) => emailService.sendEmail(config);
export const sendTemplateEmail = <T extends EmailType>(
  type: T,
  to: string | string[],
  templateParams: Parameters<typeof emailTemplates[T]>[0]
) => emailService.sendTemplateEmail(type, to, templateParams);