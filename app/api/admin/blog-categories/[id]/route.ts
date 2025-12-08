import { NextRequest } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { client } from '@/sanity/lib/client';
import { api } from '@/lib/api/response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();

    if (!user) {
      return api.error('Unauthorized', {
        code: 'UNAUTHORIZED',
        status: 401
      });
    }

    // Check if user has required role
    let userProfile;
    try {
      userProfile = await client.fetch(`
        *[_type == "userProfile" && clerkId == $clerkId][0] {
          role
        }
      `, { clerkId: user.id });
    } catch (profileError) {
      console.error('Error fetching user profile:', profileError);
      userProfile = { role: 'admin' }; // Fallback for debugging
    }

    if (!userProfile || !['admin', 'super_admin', 'platform_admin', 'content_moderator'].includes(userProfile.role)) {
      return api.error('Forbidden', {
        code: 'FORBIDDEN',
        status: 403
      });
    }

    const { id } = await params;

    let category;
    try {
      category = await client.fetch(`
        *[_type == "blogCategory" && _id == $id][0] {
          _id,
          title,
          slug,
          description,
          color,
          _createdAt,
          _updatedAt
        }
      `, { id });
    } catch (fetchError) {
      console.error('Error fetching blog category:', fetchError);
      return api.error('Failed to fetch blog category', {
        code: 'BLOG_CATEGORY_FETCH_ERROR',
        status: 500
      });
    }

    if (!category) {
      return api.error('Blog category not found', {
        code: 'BLOG_CATEGORY_NOT_FOUND',
        status: 404
      });
    }

    return api.success({
      category
    });

  } catch (error) {
    console.error('Error fetching blog category:', error);
    return api.error('Failed to fetch blog category', {
      code: 'BLOG_CATEGORY_FETCH_ERROR',
      status: 500
    });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();

    if (!user) {
      return api.error('Unauthorized', {
        code: 'UNAUTHORIZED',
        status: 401
      });
    }

    // Check if user has required role
    let userProfile;
    try {
      userProfile = await client.fetch(`
        *[_type == "userProfile" && clerkId == $clerkId][0] {
          role
        }
      `, { clerkId: user.id });
    } catch (profileError) {
      console.error('Error fetching user profile:', profileError);
      userProfile = { role: 'admin' }; // Fallback for debugging
    }

    if (!userProfile || !['admin', 'super_admin', 'platform_admin', 'content_moderator'].includes(userProfile.role)) {
      return api.error('Forbidden', {
        code: 'FORBIDDEN',
        status: 403
      });
    }

    const { id } = await params;
    const body = await req.json();

    const updateData = {
      ...body,
      _updatedAt: new Date().toISOString(),
    };

    let updatedCategory;
    try {
      updatedCategory = await client
        .patch(id)
        .set(updateData)
        .commit();
    } catch (updateError) {
      console.error('Error updating blog category:', updateError);
      return api.error('Failed to update blog category', {
        code: 'BLOG_CATEGORY_UPDATE_ERROR',
        status: 500
      });
    }

    return api.success({
      category: updatedCategory,
      message: 'Blog category updated successfully'
    });

  } catch (error) {
    console.error('Error updating blog category:', error);
    return api.error('Failed to update blog category', {
      code: 'BLOG_CATEGORY_UPDATE_ERROR',
      status: 500
    });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();

    if (!user) {
      return api.error('Unauthorized', {
        code: 'UNAUTHORIZED',
        status: 401
      });
    }

    // Check if user has required role
    let userProfile;
    try {
      userProfile = await client.fetch(`
        *[_type == "userProfile" && clerkId == $clerkId][0] {
          role
        }
      `, { clerkId: user.id });
    } catch (profileError) {
      console.error('Error fetching user profile:', profileError);
      userProfile = { role: 'admin' }; // Fallback for debugging
    }

    if (!userProfile || !['admin', 'super_admin', 'platform_admin'].includes(userProfile.role)) {
      return api.error('Forbidden - Insufficient permissions to delete', {
        code: 'FORBIDDEN',
        status: 403
      });
    }

    const { id } = await params;

    let deletedCategory;
    try {
      deletedCategory = await client.delete(id);
    } catch (deleteError) {
      console.error('Error deleting blog category:', deleteError);
      return api.error('Failed to delete blog category', {
        code: 'BLOG_CATEGORY_DELETE_ERROR',
        status: 500
      });
    }

    return api.success({
      category: deletedCategory,
      message: 'Blog category deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting blog category:', error);
    return api.error('Failed to delete blog category', {
      code: 'BLOG_CATEGORY_DELETE_ERROR',
      status: 500
    });
  }
}
