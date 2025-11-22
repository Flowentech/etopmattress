import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email/service';
import { getUserProfile } from '@/lib/auth/user-profile';
import { getAuth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow admins to send emails programmatically
    const userProfile = await getUserProfile(userId);
    if (!userProfile || !['admin', 'super_admin'].includes(userProfile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { to, subject, html, text, type, templateParams } = body;

    if (!to) {
      return NextResponse.json({ error: 'Recipient email is required' }, { status: 400 });
    }

    let result;

    if (type && templateParams) {
      // Send template email
      result = await emailService.sendTemplateEmail(type, to, templateParams);
    } else {
      // Send custom email
      result = await emailService.sendCustomEmail({
        to,
        subject,
        html,
        text,
      });
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      message: 'Email sent successfully'
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email', success: false },
      { status: 500 }
    );
  }
}