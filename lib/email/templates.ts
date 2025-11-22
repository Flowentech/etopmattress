// Email templates for different notification types

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export const emailTemplates = {
  // Seller onboarding emails
  sellerApplicationReceived: (storeName: string): EmailTemplate => ({
    subject: 'Application Received - Your Store is Under Review',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Store Application Received!</h1>
        </div>

        <div style="padding: 30px; background-color: #f9fafb;">
          <p>Dear Seller,</p>

          <p>Thank you for applying to become a seller on InterioWale! We've received your application for <strong>${storeName}</strong>.</p>

          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #92400e;">What happens next?</h3>
            <ul style="margin: 0; padding-left: 20px; color: #92400e;">
              <li>Our admin team will review your application within 1-2 business days</li>
              <li>You'll receive an email once your store is approved</li>
              <li>Once approved, you can start adding products and selling</li>
            </ul>
          </div>

          <p>You can check your application status anytime in your dashboard.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/seller" style="background-color: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
              View Dashboard
            </a>
          </div>

          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
            Best regards,<br>
            The InterioWale Team
          </p>
        </div>
      </div>
    `,
    text: `Your store application for ${storeName} has been received and is under review. We'll notify you once it's approved.`
  }),

  sellerApplicationApproved: (storeName: string, storeUrl: string): EmailTemplate => ({
    subject: '🎉 Congratulations! Your Store Has Been Approved',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Store Approved!</h1>
        </div>

        <div style="padding: 30px; background-color: #f9fafb;">
          <p>Dear Seller,</p>

          <p>Congratulations! Your store <strong>${storeName}</strong> has been approved and is now live on InterioWale!</p>

          <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #065f46;">You can now:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #065f46;">
              <li>Add products to your store</li>
              <li>Manage orders and inventory</li>
              <li>Track your earnings and analytics</li>
              <li>View your live store at: ${storeUrl}</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/seller" style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin-right: 10px;">
              Go to Dashboard
            </a>
            <a href="${storeUrl}" style="background-color: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
              View Store
            </a>
          </div>

          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
            Best regards,<br>
            The InterioWale Team
          </p>
        </div>
      </div>
    `,
    text: `Congratulations! Your store ${storeName} has been approved. You can now start selling on InterioWale. View your store: ${storeUrl}`
  }),

  sellerApplicationRejected: (storeName: string, reason?: string): EmailTemplate => ({
    subject: 'Update on Your Store Application',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Application Update</h1>
        </div>

        <div style="padding: 30px; background-color: #f9fafb;">
          <p>Dear Seller,</p>

          <p>After careful review, we're unable to approve your application for <strong>${storeName}</strong> at this time.</p>

          ${reason ? `
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #991b1b;">Reason:</h3>
            <p style="margin: 0; color: #991b1b;">${reason}</p>
          </div>
          ` : ''}

          <p>You can reapply after addressing the feedback. Please review our seller guidelines and ensure all information is accurate.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/become-seller" style="background-color: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Reapply Now
            </a>
          </div>

          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
            Best regards,<br>
            The InterioWale Team
          </p>
        </div>
      </div>
    `,
    text: `Your store application for ${storeName} was not approved. ${reason ? `Reason: ${reason}` : ''} You can reapply after addressing the feedback.`
  }),

  // Architecture firm emails
  architectureApplicationReceived: (firmName: string): EmailTemplate => ({
    subject: 'Architecture Firm Application Received - Under Review',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Firm Application Received!</h1>
        </div>

        <div style="padding: 30px; background-color: #f9fafb;">
          <p>Dear Architect,</p>

          <p>Thank you for applying to join InterioWale Architecture! We've received your application for <strong>${firmName}</strong>.</p>

          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #92400e;">What happens next?</h3>
            <ul style="margin: 0; padding-left: 20px; color: #92400e;">
              <li>Our admin team will review your firm's credentials</li>
              <li>We'll verify your certifications and portfolio</li>
              <li>You'll receive an email within 2-3 business days</li>
              <li>Once approved, you can start receiving project proposals</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/architect" style="background-color: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
              View Dashboard
            </a>
          </div>

          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
            Best regards,<br>
            The InterioWale Team
          </p>
        </div>
      </div>
    `,
    text: `Your architecture firm application for ${firmName} has been received and is under review. We'll notify you once it's approved.`
  }),

  architectureApplicationApproved: (firmName: string, firmUrl: string): EmailTemplate => ({
    subject: '🎉 Congratulations! Your Architecture Firm Has Been Approved',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Firm Approved!</h1>
        </div>

        <div style="padding: 30px; background-color: #f9fafb;">
          <p>Dear Architect,</p>

          <p>Congratulations! Your architecture firm <strong>${firmName}</strong> has been approved and is now live on InterioWale!</p>

          <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #065f46;">You can now:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #065f46;">
              <li>Add architecture services to your profile</li>
              <li>Submit proposals for client projects</li>
              <li>Manage ongoing projects and clients</li>
              <li>Track your earnings and analytics</li>
              <li>View your public profile at: ${firmUrl}</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/architect" style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin-right: 10px;">
              Go to Dashboard
            </a>
            <a href="${firmUrl}" style="background-color: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
              View Profile
            </a>
          </div>

          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
            Best regards,<br>
            The InterioWale Team
          </p>
        </div>
      </div>
    `,
    text: `Congratulations! Your architecture firm ${firmName} has been approved. You can now start taking projects on InterioWale. View your profile: ${firmUrl}`
  }),

  // Order notifications
  newOrder: (orderNumber: string, customerName: string, total: number): EmailTemplate => ({
    subject: `🛒 New Order Received - #${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">🛒 New Order!</h1>
        </div>

        <div style="padding: 30px; background-color: #f9fafb;">
          <p>Congratulations! You've received a new order.</p>

          <div style="background-color: #ede9fe; border-left: 4px solid #6366f1; padding: 15px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #4c1d95;">Order Details:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #4c1d95;">
              <li><strong>Order Number:</strong> #${orderNumber}</li>
              <li><strong>Customer:</strong> ${customerName}</li>
              <li><strong>Total Amount:</strong> ৳${total.toLocaleString()}</li>
            </ul>
          </div>

          <p>Please process this order as soon as possible. You can view all order details in your dashboard.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/seller?tab=orders" style="background-color: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
              View Order
            </a>
          </div>

          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
            Best regards,<br>
            The InterioWale Team
          </p>
        </div>
      </div>
    `,
    text: `You've received a new order #${orderNumber} from ${customerName} for ৳${total.toLocaleString()}. Please check your dashboard to process it.`
  }),

  // Project notifications
  newProjectProposal: (projectTitle: string, clientName: string): EmailTemplate => ({
    subject: `🏗️ New Project Proposal Received - ${projectTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">🏗️ New Project!</h1>
        </div>

        <div style="padding: 30px; background-color: #f9fafb;">
          <p>Great news! A new project proposal is available for your firm.</p>

          <div style="background-color: #ede9fe; border-left: 4px solid #6366f1; padding: 15px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #4c1d95;">Project Details:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #4c1d95;">
              <li><strong>Project Title:</strong> ${projectTitle}</li>
              <li><strong>Client:</strong> ${clientName}</li>
            </ul>
          </div>

          <p>Submit your proposal now to win this project!</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/architecture/projects" style="background-color: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
              View Projects
            </a>
          </div>

          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
            Best regards,<br>
            The InterioWale Team
          </p>
        </div>
      </div>
    `,
    text: `A new project proposal "${projectTitle}" from ${clientName} is available. Submit your proposal in your dashboard.`
  })
};