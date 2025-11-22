import { NextRequest } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { client } from '@/sanity/lib/client';
import { api } from '@/lib/api/response';
import { validateRequest, schemas, ValidationError } from '@/lib/validation/schemas';

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return api.error('Unauthorized', {
        code: 'UNAUTHORIZED',
        status: 401
      });
    }

    // Check if user has required role (platform admin or content moderator)
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
      console.warn('User does not have required role:', user.id, 'role:', userProfile?.role);
      return api.error('Forbidden', {
        code: 'FORBIDDEN',
        status: 403
      });
    }

    // Validate query parameters
    const { searchParams } = new URL(req.url);
    const queryData = {
      limit: searchParams.get('limit') || '20',
      offset: searchParams.get('offset') || '0',
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      featured: searchParams.get('featured') || '',
    };

    const validatedQuery = validateRequest(schemas.pagination, queryData);
    const { limit, offset, search } = validatedQuery;
    const category = queryData.category;
    const featured = queryData.featured;

    // Build query for gallery items
    let query = `*[_type == "gallery"`;

    if (search) {
      query += ` && (
        title match "*${search}*" ||
        description match "*${search}*"
      )`;
    }

    if (category && category !== 'all') {
      query += ` && category == $category`;
    }

    if (featured === 'true') {
      query += ` && isFeatured == true`;
    }

    query += `] | order(createdAt desc) [${offset}...${offset + limit}] {
      _id,
      title,
      slug,
      category,
      image,
      description,
      detailedDescription,
      gallery,
      features,
      isFeatured,
      createdAt,
      updatedAt
    }`;

    let galleryItems;
    try {
      galleryItems = await client.fetch(query, { category });
    } catch (fetchError) {
      console.error('Error fetching gallery items:', fetchError);
      galleryItems = [];
    }

    // Get total count for pagination
    let countQuery = `count(*[_type == "gallery"`;

    if (search) {
      countQuery += ` && (
        title match "*${search}*" ||
        description match "*${search}*"
      )`;
    }

    if (category && category !== 'all') {
      countQuery += ` && category == $category`;
    }

    if (featured === 'true') {
      countQuery += ` && isFeatured == true`;
    }

    countQuery += `])`;

    let total;
    try {
      total = await client.fetch(countQuery, { category });
    } catch (countError) {
      console.error('Error counting gallery items:', countError);
      total = 0;
    }

    return api.success({
      gallery: galleryItems || [],
      pagination: {
        total: total || 0,
        limit,
        offset,
        hasMore: total ? offset + limit < total : false
      }
    });

  } catch (error) {
    console.error('Error fetching gallery items:', error);
    return api.error('Failed to fetch gallery items', {
      code: 'GALLERY_FETCH_ERROR',
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
    const validatedData = validateRequest(schemas.gallery, body);

    const galleryData = {
      ...validatedData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let newGalleryItem;
    try {
      newGalleryItem = await client.create(galleryData);
    } catch (createError) {
      console.error('Error creating gallery item:', createError);
      return api.error('Failed to create gallery item', {
        code: 'GALLERY_CREATE_ERROR',
        status: 500
      });
    }

    return api.success({
      gallery: newGalleryItem,
      message: 'Gallery item created successfully'
    });

  } catch (error) {
    console.error('Error creating gallery item:', error);
    if (error instanceof ValidationError) {
      return api.error('Validation failed', {
        code: 'VALIDATION_ERROR',
        status: 400,
        details: error.errors
      });
    }
    return api.error('Failed to create gallery item', {
      code: 'GALLERY_CREATE_ERROR',
      status: 500
    });
  }
}