import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { backendClient } from '@/sanity/lib/backendClient';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Get the Svix headers for verification
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no Svix headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('Error: Missing Svix headers', { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Get the Webhook secret from environment
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('Error: CLERK_WEBHOOK_SECRET is not set');
    return new NextResponse('Error: Webhook secret not configured', { status: 500 });
  }

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the webhook signature
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error: Could not verify webhook:', err);
    return new NextResponse('Error: Verification failed', { status: 400 });
  }

  // Handle the webhook
  const eventType = evt.type;
  console.log(`Clerk Webhook received: ${eventType}`);

  // Handle user.created event
  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    try {
      // Create user profile in Sanity
      const userProfile = await backendClient.create({
        _type: 'userProfile',
        clerkId: id,
        email: email_addresses[0]?.email_address || '',
        firstName: first_name || '',
        lastName: last_name || '',
        profilePicture: image_url || '',
        role: 'customer', // Default role
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      console.log('User profile created in Sanity:', userProfile._id);
      return NextResponse.json({ success: true, userId: userProfile._id });
    } catch (error) {
      console.error('Error creating user profile in Sanity:', error);
      return new NextResponse('Error: Failed to create user profile', { status: 500 });
    }
  }

  // Handle user.updated event
  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    try {
      // Find and update user profile in Sanity
      const existingUser = await backendClient.fetch(
        `*[_type == "userProfile" && clerkId == $clerkId][0]`,
        { clerkId: id }
      );

      if (existingUser) {
        const updatedProfile = await backendClient
          .patch(existingUser._id)
          .set({
            email: email_addresses[0]?.email_address || existingUser.email,
            firstName: first_name || existingUser.firstName,
            lastName: last_name || existingUser.lastName,
            profilePicture: image_url || existingUser.profilePicture,
            updatedAt: new Date().toISOString(),
          })
          .commit();

        console.log('User profile updated in Sanity:', updatedProfile._id);
        return NextResponse.json({ success: true, userId: updatedProfile._id });
      } else {
        console.warn('User not found in Sanity, creating new profile');
        // Create if doesn't exist
        const userProfile = await backendClient.create({
          _type: 'userProfile',
          clerkId: id,
          email: email_addresses[0]?.email_address || '',
          firstName: first_name || '',
          lastName: last_name || '',
          profilePicture: image_url || '',
          role: 'customer',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        console.log('User profile created in Sanity:', userProfile._id);
        return NextResponse.json({ success: true, userId: userProfile._id });
      }
    } catch (error) {
      console.error('Error updating user profile in Sanity:', error);
      return new NextResponse('Error: Failed to update user profile', { status: 500 });
    }
  }

  // Handle user.deleted event
  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    try {
      // Find user profile in Sanity
      const existingUser = await backendClient.fetch(
        `*[_type == "userProfile" && clerkId == $clerkId][0]`,
        { clerkId: id }
      );

      if (existingUser) {
        // Soft delete by marking as inactive
        await backendClient
          .patch(existingUser._id)
          .set({
            isActive: false,
            updatedAt: new Date().toISOString(),
          })
          .commit();

        console.log('User profile soft deleted in Sanity:', existingUser._id);
        return NextResponse.json({ success: true });
      }
    } catch (error) {
      console.error('Error deleting user profile in Sanity:', error);
      return new NextResponse('Error: Failed to delete user profile', { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
