import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { client } from '@/sanity/lib/client';
import { backendClient } from '@/sanity/lib/backendClient';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Validate file size (10MB max)
    const maxSize = parseInt(process.env.ADMIN_UPLOAD_MAX_SIZE || '10485760');
    if (image.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${(maxSize / 1024 / 1024).toFixed(1)}MB` },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(image.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, WebP, and GIF are allowed' },
        { status: 400 }
      );
    }

    // Upload to Sanity
    const imageAsset = await backendClient.assets.upload('image', image, {
      filename: image.name,
    });

    return NextResponse.json({
      success: true,
      imageUrl: imageAsset.url,
      assetId: imageAsset._id,
      dimensions: {
        width: imageAsset.metadata?.dimensions?.width,
        height: imageAsset.metadata?.dimensions?.height,
      },
      originalSize: image.size,
    });

  } catch (error) {
    console.error('Admin image upload failed:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
