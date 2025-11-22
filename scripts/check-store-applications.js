/**
 * Script to check store applications in Sanity database
 * Run with: node scripts/check-store-applications.js
 */

const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'lmxqy59r',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
});

async function checkStoreApplications() {
  try {
    console.log('🔍 Checking store applications in Sanity...\n');

    // Count total applications
    const totalCount = await client.fetch(`count(*[_type == "storeApplication"])`);
    console.log(`📊 Total store applications: ${totalCount}\n`);

    if (totalCount === 0) {
      console.log('❌ No store applications found in database');
      console.log('💡 This could mean:');
      console.log('   1. No users have submitted applications yet');
      console.log('   2. Applications were deleted');
      console.log('   3. The schema type name might be different\n');

      // Check for similar document types
      console.log('🔍 Checking for other document types...');
      const allTypes = await client.fetch(`
        array::unique(*[]._type)
      `);
      console.log('Available document types:', allTypes);

      return;
    }

    // Fetch all applications
    const applications = await client.fetch(`
      *[_type == "storeApplication"] | order(submittedAt desc) {
        _id,
        _createdAt,
        status,
        "storeName": storeInfo.storeName,
        "applicantEmail": applicantInfo.email,
        "applicantName": applicantInfo.firstName + " " + applicantInfo.lastName,
        submittedAt,
        reviewedAt
      }
    `);

    console.log('📋 Store Applications:\n');
    applications.forEach((app, index) => {
      console.log(`${index + 1}. ${app.storeName || 'Unnamed'}`);
      console.log(`   ID: ${app._id}`);
      console.log(`   Applicant: ${app.applicantName} (${app.applicantEmail})`);
      console.log(`   Status: ${app.status}`);
      console.log(`   Submitted: ${app.submittedAt || app._createdAt}`);
      console.log(`   Reviewed: ${app.reviewedAt || 'Not yet'}\n`);
    });

    // Status breakdown
    const statusCounts = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});

    console.log('📊 Status Breakdown:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Error checking store applications:', error.message);
    console.error('Full error:', error);
  }
}

checkStoreApplications();
