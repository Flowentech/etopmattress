import { NextRequest } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { client } from '@/sanity/lib/client';
import { api } from '@/lib/api/response';

export async function GET(req: NextRequest) {
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

    const query = `*[_type == "blogCategory"] | order(title asc) {
      _id,
      title,
      slug,
      description,
      color,
      _createdAt,
      _updatedAt
    }`;

    let categories;
    try {
      categories = await client.fetch(query);
    } catch (fetchError) {
      console.error('Error fetching blog categories:', fetchError);
      categories = [];
    }

    return api.success({
      categories: categories || []
    });

  } catch (error) {
    console.error('Error fetching blog categories:', error);
    return api.error('Failed to fetch blog categories', {
      code: 'BLOG_CATEGORY_FETCH_ERROR',
      status: 500,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function POST(req: NextRequest) {
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

    const body = await req.json();

    const categoryData = {
      ...body,
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
    };

    let newCategory;
    try {
      newCategory = await client.create(categoryData);
    } catch (createError) {
      console.error('Error creating blog category:', createError);
      return api.error('Failed to create blog category', {
        code: 'BLOG_CATEGORY_CREATE_ERROR',
        status: 500
      });
    }

    return api.success({
      category: newCategory,
      message: 'Blog category created successfully'
    });

  } catch (error) {
    console.error('Error creating blog category:', error);
    return api.error('Failed to create blog category', {
      code: 'BLOG_CATEGORY_CREATE_ERROR',
      status: 500
    });
  }
}
