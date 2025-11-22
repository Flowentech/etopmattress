import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@sanity/client';

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2023-05-03',
});

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Security: Only allow specific email to become super admin
    const allowedEmails = ['admin@interiowale.com', 'israfil@interiowale.com', 'israfilhossain166091@gmail.com'];
    const userEmail = user.emailAddresses[0]?.emailAddress;
    
    if (!allowedEmails.includes(userEmail || '')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if any super admin exists
    const existingAdmin = await writeClient.fetch(`
      *[_type == "userRole" && role == "supreme_admin"][0]
    `);

    if (existingAdmin) {
      return NextResponse.json({ error: 'Super admin already exists' }, { status: 400 });
    }

    // Create super admin role for current user
    const result = await writeClient.create({
      _type: 'userRole',
      userId: user.id,
      userEmail: user.emailAddresses[0]?.emailAddress || '',
      role: 'supreme_admin',
      permissions: [],
      isActive: true,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Super admin created successfully',
      adminId: result._id 
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 });
  }
}