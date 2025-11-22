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

    let galleryItem;
    try {
      galleryItem = await client.fetch(`
        *[_type == "gallery" && _id == $id][0] {
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
        }
      `, { id });
    } catch (fetchError) {
      console.error('Error fetching gallery item:', fetchError);
      return api.error('Failed to fetch gallery item', {
        code: 'GALLERY_FETCH_ERROR',
        status: 500
      });
    }

    if (!galleryItem) {
      return api.error('Gallery item not found', {
        code: 'GALLERY_NOT_FOUND',
        status: 404
      });
    }

    return api.success({
      gallery: galleryItem
    });

  } catch (error) {
    console.error('Error fetching gallery item:', error);
    return api.error('Failed to fetch gallery item', {
      code: 'GALLERY_FETCH_ERROR',
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
    const validatedData = validateRequest(schemas.gallery, body);

    const updateData = {
      ...validatedData,
      updatedAt: new Date().toISOString(),
    };

    let updatedGalleryItem;
    try {
      updatedGalleryItem = await client
        .patch(id)
        .set(updateData)
        .commit();
    } catch (updateError) {
      console.error('Error updating gallery item:', updateError);
      return api.error('Failed to update gallery item', {
        code: 'GALLERY_UPDATE_ERROR',
        status: 500
      });
    }

    return api.success({
      gallery: updatedGalleryItem,
      message: 'Gallery item updated successfully'
    });

  } catch (error) {
    console.error('Error updating gallery item:', error);
    if (error instanceof ValidationError) {
      return api.error('Validation failed', {
        code: 'VALIDATION_ERROR',
        status: 400,
        details: error.errors
      });
    }
    return api.error('Failed to update gallery item', {
      code: 'GALLERY_UPDATE_ERROR',
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

    let deletedGalleryItem;
    try {
      deletedGalleryItem = await client.delete(id);
    } catch (deleteError) {
      console.error('Error deleting gallery item:', deleteError);
      return api.error('Failed to delete gallery item', {
        code: 'GALLERY_DELETE_ERROR',
        status: 500
      });
    }

    return api.success({
      gallery: deletedGalleryItem,
      message: 'Gallery item deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting gallery item:', error);
    return api.error('Failed to delete gallery item', {
      code: 'GALLERY_DELETE_ERROR',
      status: 500
    });
  }
}