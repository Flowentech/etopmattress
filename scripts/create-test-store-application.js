/**
 * Create a test store application
 * Run with: node -r dotenv/config scripts/create-test-store-application.js
 */

const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN,
});

async function createTestApplication() {
  try {
    console.log('📝 Creating test store application...\n');

    const testApplication = {
      _type: 'storeApplication',
      applicantInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-0123'
      },
      businessInfo: {
        businessName: 'Modern Furniture Co.',
        businessType: 'LLC',
        taxId: 'TAX-123456',
        registrationNumber: 'REG-789012',
        address: {
          street: '123 Business Street',
          city: 'San Francisco',
          state: 'California',
          zipCode: '94102',
          country: 'United States'
        }
      },
      storeInfo: {
        storeName: 'Modern Furniture Emporium',
        storeDescription: 'A curated collection of modern and contemporary furniture for your home and office',
        categories: ['Furniture', 'Home Decor', 'Living Room', 'Office'],
        estimatedMonthlyVolume: 15000
      },
      status: 'pending',
      submittedAt: new Date().toISOString()
    };

    const result = await client.create(testApplication);

    console.log('✅ Test application created successfully!\n');
    console.log(`   ID: ${result._id}`);
    console.log(`   Store: ${testApplication.storeInfo.storeName}`);
    console.log(`   Status: ${testApplication.status}`);
    console.log(`   Email: ${testApplication.applicantInfo.email}\n`);
    console.log('🎉 You can now view this in your admin panel at:');
    console.log('   http://localhost:3000/admin/store-applications\n');

  } catch (error) {
    console.error('❌ Error creating test application:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure you ran: npx sanity deploy');
    console.error('2. Check that SANITY_API_TOKEN is set in .env.local');
    console.error('3. Verify the storeApplication schema is deployed\n');
  }
}

createTestApplication();
