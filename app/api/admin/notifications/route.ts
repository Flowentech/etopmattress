import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { client, writeClient } from '@/sanity/lib/client';
import { notificationService } from '@/lib/notifications/service';
import { api } from '@/lib/api/response';
import { cache } from '@/lib/cache/service';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return api.error('Unauthorized', {
        code: 'UNAUTHORIZED',
        status: 401
      });
    }

    // Check if user is admin
    const userProfile = await client.fetch(`
      *[_type == "userProfile" && clerkId == $clerkId][0] {
        role
      }
    `, { clerkId: user.id });

    if (!userProfile || !['admin', 'super_admin'].includes(userProfile.role)) {
      return api.error('Forbidden', {
        code: 'FORBIDDEN',
        status: 403
      });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status') || 'all';

    let query = `*[_type == "notification"]`;

    if (status !== 'all') {
      query += ` && status == "${status}"`;
    }

    query += ` | order(_createdAt desc) [${offset}...${offset + limit}] {
      _id,
      title,
      message,
      type,
      targetAudience,
      priority,
      status,
      createdAt,
      sentAt,
      scheduledFor,
      readBy,
      createdBy
    }`;

    const notifications = await client.fetch(query);

    // Get total count for pagination
    const countQuery = `count(*[_type == "notification"${status !== 'all' ? ` && status == "${status}"` : ''}])`;
    const total = await client.fetch(countQuery);

    // Calculate stats
    const allStatuses = await client.fetch(`
      *[_type == "notification"] {
        status
      }
    `);

    const stats = allStatuses.reduce((acc: any, notif: any) => {
      acc.total = (acc.total || 0) + 1;
      acc[notif.status] = (acc[notif.status] || 0) + 1;
      return acc;
    }, {
      total: 0,
      draft: 0,
      sent: 0,
      scheduled: 0
    });

    return api.success({
      notifications,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      },
      stats
    }, {
      enablePerformanceMonitoring: true
    });

  } catch (error) {
    console.error('Notifications API error:', error);
    return api.error('Failed to fetch notifications', {
      code: 'INTERNAL_ERROR',
      status: 500
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return api.error('Unauthorized', {
        code: 'UNAUTHORIZED',
        status: 401
      });
    }

    // Check if user is admin
    const userProfile = await client.fetch(`
      *[_type == "userProfile" && clerkId == $clerkId][0] {
        role
      }
    `, { clerkId: user.id });

    if (!userProfile || !['admin', 'super_admin'].includes(userProfile.role)) {
      return api.error('Forbidden', {
        code: 'FORBIDDEN',
        status: 403
      });
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = ['title', 'message', 'type', 'targetAudience', 'priority'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return api.error(`Missing required field: ${field}`, {
          code: 'MISSING_FIELD',
          status: 400
        });
      }
    }

    // Validate notification type
    const validTypes = ['info', 'warning', 'success', 'error'];
    if (!validTypes.includes(body.type)) {
      return api.error('Invalid notification type', {
        code: 'INVALID_TYPE',
        status: 400
      });
    }

    // Validate target audience
    const validAudiences = ['all', 'sellers', 'customers', 'architects', 'admins'];
    if (!validAudiences.includes(body.targetAudience)) {
      return api.error('Invalid target audience', {
        code: 'INVALID_AUDIENCE',
        status: 400
      });
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(body.priority)) {
      return api.error('Invalid priority level', {
        code: 'INVALID_PRIORITY',
        status: 400
      });
    }

    const notificationDoc = {
      _type: 'notification',
      title: body.title,
      message: body.message,
      type: body.type,
      targetAudience: body.targetAudience,
      priority: body.priority,
      status: body.status || 'draft',
      createdAt: new Date().toISOString(),
      scheduledFor: body.scheduledFor || null,
      sentAt: null,
      readBy: [],
      createdBy: {
        clerkId: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.emailAddresses?.[0]?.emailAddress || ''
      }
    };

    const result = await writeClient.create(notificationDoc);

    return api.success({
      notification: result,
      message: 'Notification created successfully'
    }, {
      status: 201,
      enablePerformanceMonitoring: true
    });

  } catch (error) {
    console.error('Create notification error:', error);
    return api.error('Failed to create notification', {
      code: 'INTERNAL_ERROR',
      status: 500
    });
  }
}