/**
 * Script to verify and check store applications
 * Run with: npx ts-node scripts/verify-store-applications.ts
 */

import { client, writeClient } from '../sanity/lib/client';

async function verifyStoreApplications() {
  try {
    console.log('🔍 Checking store applications...\n');

    // Check total count
    const count = await client.fetch(`count(*[_type == "storeApplication"])`);
    console.log(`📊 Total store applications: ${count}\n`);

    if (count === 0) {
      console.log('❌ No store applications found!\n');
      console.log('Would you like to create test data? (This would help verify the system works)');
      console.log('Uncomment the createTestApplication() call at the end of this script.\n');
      return;
    }

    // Fetch all applications
    const applications = await client.fetch(`
      *[_type == "storeApplication"] | order(submittedAt desc) {
        _id,
        status,
        storeInfo,
        applicantInfo,
        businessInfo,
        submittedAt,
        reviewedAt,
        reviewNotes,
        _createdAt
      }
    `);

    console.log('📋 Applications found:\n');
    applications.forEach((app: any, idx: number) => {
      console.log(`${idx + 1}. ${app.storeInfo?.storeName || 'Unnamed Store'}`);
      console.log(`   Status: ${app.status}`);
      console.log(`   Applicant: ${app.applicantInfo?.email || 'N/A'}`);
      console.log(`   Submitted: ${app.submittedAt || app._createdAt}`);
      console.log('');
    });

    // Status counts
    const statusCounts = applications.reduce((acc: any, app: any) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});

    console.log('📊 Status breakdown:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function createTestApplication() {
  try {
    console.log('📝 Creating test store application...\n');

    const testApplication = {
      _type: 'storeApplication',
      applicantInfo: {
        firstName: 'Test',
        lastName: 'Seller',
        email: 'testseller@example.com',
        phone: '+1234567890'
      },
      businessInfo: {
        businessName: 'Test Furniture Store',
        businessType: 'Retail',
        taxId: 'TAX123456',
        registrationNumber: 'REG789012',
        address: {
          street: '123 Main Street',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          country: 'USA'
        }
      },
      storeInfo: {
        storeName: 'Test Furniture Emporium',
        storeDescription: 'A test store selling modern furniture',
        categories: ['Furniture', 'Home Decor', 'Living Room'],
        estimatedMonthlyVolume: 10000
      },
      status: 'pending' as const,
      submittedAt: new Date().toISOString()
    };

    const result = await writeClient.create(testApplication);
    console.log('✅ Test application created successfully!');
    console.log(`   ID: ${result._id}`);
    console.log(`   Store: ${testApplication.storeInfo.storeName}\n`);
    console.log('You can now view this in your admin panel at /admin/store-applications');

  } catch (error) {
    console.error('❌ Error creating test application:', error);
  }
}

// Run verification
verifyStoreApplications().then(() => {
  console.log('\n✨ Done!');
  process.exit(0);
});

// Uncomment to create test data:
// createTestApplication().then(() => process.exit(0));
