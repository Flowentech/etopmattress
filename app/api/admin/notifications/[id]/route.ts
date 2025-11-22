import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { client, writeClient } from '@/sanity/lib/client';
import { api } from '@/lib/api/response';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
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

    // Check if notification exists
    const notification = await client.fetch(`
      *[_type == "notification" && _id == $id][0]
    `, { id: params.id });

    if (!notification) {
      return api.error('Notification not found', {
        code: 'NOT_FOUND',
        status: 404
      });
    }

    // Delete the notification
    await writeClient.delete(params.id);

    return api.success({
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    return api.error('Failed to delete notification', {
      code: 'INTERNAL_ERROR',
      status: 500
    });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
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

    // Check if notification exists
    const notification = await client.fetch(`
      *[_type == "notification" && _id == $id][0]
    `, { id: params.id });

    if (!notification) {
      return api.error('Notification not found', {
        code: 'NOT_FOUND',
        status: 404
      });
    }

    // Update the notification
    const updates: any = {};
    if (body.title) updates.title = body.title;
    if (body.message) updates.message = body.message;
    if (body.type) updates.type = body.type;
    if (body.targetAudience) updates.targetAudience = body.targetAudience;
    if (body.priority) updates.priority = body.priority;
    if (body.status) updates.status = body.status;
    if (body.scheduledFor) updates.scheduledFor = body.scheduledFor;
    updates.updatedAt = new Date().toISOString();

    const result = await writeClient
      .patch(params.id)
      .set(updates)
      .commit();

    return api.success({
      notification: result,
      message: 'Notification updated successfully'
    });

  } catch (error) {
    console.error('Update notification error:', error);
    return api.error('Failed to update notification', {
      code: 'INTERNAL_ERROR',
      status: 500
    });
  }
}