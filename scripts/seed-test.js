// Test seeding script - simple and direct
const { createClient } = require('next-sanity');
const { v4: uuidv4 } = require('uuid');

// Create Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '030f6vpi',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
});

console.log('🔗 Sanity client created');
console.log('Project ID:', process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
console.log('Dataset:', process.env.NEXT_PUBLIC_SANITY_DATASET);

// Simple test data
const testGalleryItem = {
  _type: 'gallery',
  _id: uuidv4(),
  title: 'Modern Living Room Transformation',
  slug: { _type: 'slug', current: 'modern-living-room-transformation' },
  description: 'A stunning transformation of a traditional living room into a modern, minimalist space with clean lines and neutral colors.',
  category: 'living-room',
  tags: ['modern', 'minimalist', 'neutral', 'contemporary'],
  featured: true,
};

// Simple test function
async function testSeeding() {
  try {
    console.log('🧪 Testing Sanity connection...');

    // Test basic connection
    const testQuery = '*[_type == "gallery"][0...3]';
    const existing = await client.fetch(testQuery);
    console.log(`✅ Found ${existing.length} existing gallery items`);

    // Create test item
    console.log('🌱 Creating test gallery item...');
    const result = await client.createIfNotExists(testGalleryItem);
    console.log(`✅ Created gallery item: ${result.title} (ID: ${result._id})`);

    console.log('🎉 Test seeding successful!');

  } catch (error) {
    console.error('❌ Error during test seeding:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testSeeding();