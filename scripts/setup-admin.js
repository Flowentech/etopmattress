// Setup script to create the first super admin
// Run this once after deploying the application

const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: '030f6vpi',
  dataset: 'production',
  useCdn: false,
  token: 'skEOTQVa2puAVTPbPy8kYTZbKrkhAVPNGyDhL8gV4OLkIciJtZcxfmroozUcKPiwNyABTwWtLVxTQe4OxBoQmdWsFgtTTaVOYfWQkMFvfK2wJzvLSgejw9m6uvsG0ZHBCdHyal0NlCcTiikGSXdTJNTlVBP6kBwo2jUCoG8WMprMOVdf8KiA',
  apiVersion: '2023-05-03',
});

async function setupSuperAdmin() {
  // Replace with your Clerk user ID and email
  const SUPER_ADMIN_USER_ID = 'user_2pqXXXXXXXXXXXXXXX'; // Get this from Clerk dashboard
  const SUPER_ADMIN_EMAIL = 'admin@interiowale.com';
  
  try {
    // Check if super admin already exists
    const existing = await client.fetch(`
      *[_type == "userRole" && userId == $userId && role == "supreme_admin"][0]
    `, { userId: SUPER_ADMIN_USER_ID });
    
    if (existing) {
      console.log('Super admin already exists');
      return;
    }
    
    // Create super admin role
    const result = await client.create({
      _type: 'userRole',
      userId: SUPER_ADMIN_USER_ID,
      userEmail: SUPER_ADMIN_EMAIL,
      role: 'supreme_admin',
      permissions: [], // Will inherit all permissions from role
      isActive: true,
    });
    
    console.log('Super admin created successfully:', result._id);
  } catch (error) {
    console.error('Error creating super admin:', error);
  }
}

setupSuperAdmin();