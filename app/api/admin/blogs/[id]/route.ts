import { NextRequest } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { client } from '@/sanity/lib/client';
import { api } from '@/lib/api/response';
import { validateRequest, schemas, ValidationError } from '@/lib/validation/schemas';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
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

    const { id } = params;

    let blog;
    try {
      blog = await client.fetch(`
        *[_type == "blog" && _id == $id][0] {
          _id,
          title,
          slug,
          excerpt,
          coverImage,
          publishedAt,
          "author": author->{
            _id,
            name,
            slug
          },
          "categories": categories[]->{
            _id,
            title,
            slug
          },
          content,
          isFeatured,
          "seo": seo {
            metaTitle,
            metaDescription,
            metaKeywords
          },
          createdAt,
          updatedAt
        }
      `, { id });
    } catch (fetchError) {
      console.error('Error fetching blog:', fetchError);
      return api.error('Failed to fetch blog', {
        code: 'BLOG_FETCH_ERROR',
        status: 500
      });
    }

    if (!blog) {
      return api.error('Blog not found', {
        code: 'BLOG_NOT_FOUND',
        status: 404
      });
    }

    return api.success({
      blog
    });

  } catch (error) {
    console.error('Error fetching blog:', error);
    return api.error('Failed to fetch blog', {
      code: 'BLOG_FETCH_ERROR',
      status: 500
    });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
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

    const { id } = params;
    const body = await req.json();
    const validatedData = validateRequest(schemas.blog, body);

    const updateData = {
      ...validatedData,
      updatedAt: new Date().toISOString(),
    };

    let updatedBlog;
    try {
      updatedBlog = await client
        .patch(id)
        .set(updateData)
        .commit();
    } catch (updateError) {
      console.error('Error updating blog:', updateError);
      return api.error('Failed to update blog', {
        code: 'BLOG_UPDATE_ERROR',
        status: 500
      });
    }

    return api.success({
      blog: updatedBlog,
      message: 'Blog updated successfully'
    });

  } catch (error) {
    console.error('Error updating blog:', error);
    if (error instanceof ValidationError) {
      return api.error('Validation failed', {
        code: 'VALIDATION_ERROR',
        status: 400,
        details: error.errors
      });
    }
    return api.error('Failed to update blog', {
      code: 'BLOG_UPDATE_ERROR',
      status: 500
    });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
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
      // Content moderators cannot delete, only edit
      return api.error('Forbidden - Insufficient permissions to delete', {
        code: 'FORBIDDEN',
        status: 403
      });
    }

    const { id } = params;

    let deletedBlog;
    try {
      deletedBlog = await client.delete(id);
    } catch (deleteError) {
      console.error('Error deleting blog:', deleteError);
      return api.error('Failed to delete blog', {
        code: 'BLOG_DELETE_ERROR',
        status: 500
      });
    }

    return api.success({
      blog: deletedBlog,
      message: 'Blog deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting blog:', error);
    return api.error('Failed to delete blog', {
      code: 'BLOG_DELETE_ERROR',
      status: 500
    });
  }
}