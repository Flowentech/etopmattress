// Load environment variables first
require('dotenv').config({ path: '.env' });

const { createClient } = require('next-sanity');
const { v4: uuidv4 } = require('uuid');

// Create Sanity client with environment variables
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
});

console.log('🔗 Sanity client created');
console.log('Project ID:', process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
console.log('Dataset:', process.env.NEXT_PUBLIC_SANITY_DATASET);
console.log('Has write token:', !!process.env.SANITY_WRITE_TOKEN);

// Simplified sample data for testing
const sampleItems = [
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Modern Living Room Transformation',
    slug: { _type: 'slug', current: 'modern-living-room-transformation' },
    description: 'A stunning transformation of a traditional living room into a modern, minimalist space with clean lines and neutral colors.',
    category: 'living-room',
    tags: ['modern', 'minimalist', 'neutral', 'contemporary'],
    featured: true,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Luxury Kitchen Makeover',
    slug: { _type: 'slug', current: 'luxury-kitchen-makeover' },
    description: 'High-end kitchen renovation featuring marble countertops, custom cabinetry, and state-of-the-art appliances.',
    category: 'kitchen',
    tags: ['luxury', 'marble', 'custom', 'modern'],
    featured: true,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Cozy Bedroom Retreat',
    slug: { _type: 'slug', current: 'cozy-bedroom-retreat' },
    description: 'A peaceful bedroom design with warm colors, soft textures, and optimal lighting for relaxation.',
    category: 'bedroom',
    tags: ['cozy', 'warm', 'relaxing', 'traditional'],
    featured: false,
  },
  {
    _type: 'landscapingProject',
    _id: uuidv4(),
    title: 'Corporate Office Green Space',
    slug: { _type: 'slug', current: 'corporate-office-green-space' },
    description: 'Complete interior plant design for a corporate office environment featuring living walls and desktop planters.',
    features: [
      '20-foot living wall installation',
      '50+ low-maintenance desk plants',
      'Automated irrigation system',
      'Air-purifying plant selection',
      'Quarterly maintenance service'
    ],
    price: 'Starting from $15,000',
    category: 'commercial',
    isActive: true,
  },
  {
    _type: 'rentalPackage',
    _id: uuidv4(),
    title: 'Starter Office Package',
    slug: { _type: 'slug', current: 'starter-office-package' },
    description: 'Perfect for small offices and startups looking to add greenery without maintenance hassle.',
    price: '$299/month',
    duration: '3-month minimum',
    features: [
      '20 desk plants',
      '4 floor plants',
      'Quarterly maintenance visits',
      'Plant replacement guarantee',
      'Delivery and setup included'
    ],
    packageType: 'basic',
    isPopular: true,
    isActive: true,
  },
  {
    _type: 'blog',
    _id: uuidv4(),
    title: '10 Low-Maintenance Plants Perfect for Busy Professionals',
    slug: { _type: 'slug', current: 'low-maintenance-plants-busy-professionals' },
    excerpt: 'Discover the best indoor plants that thrive with minimal care, perfect for busy professionals who want greenery without the hassle.',
    content: 'For busy professionals, maintaining indoor plants can seem like another task. However, the benefits are well-documented - from improved air quality to reduced stress levels. Snake plants, ZZ plants, and pothos are excellent low-maintenance options.',
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    isFeatured: true,
  }
];

// Simple seeding function
async function seedSampleData() {
  try {
    console.log('🌱 Starting to seed sample data...');

    // Test connection first
    console.log('🧪 Testing Sanity connection...');
    const testQuery = '*[_type == "gallery"][0...1]';
    const existing = await client.fetch(testQuery);
    console.log(`✅ Connection successful - Found ${existing.length} existing gallery items`);

    // Seed items one by one
    for (let i = 0; i < sampleItems.length; i++) {
      const item = sampleItems[i];
      try {
        console.log(`📝 Creating ${item._type}: ${item.title}`);
        const result = await client.createIfNotExists(item);
        console.log(`✅ Created: ${result.title} (ID: ${result._id})`);
      } catch (error) {
        console.error(`❌ Error creating ${item.title}:`, error.message);
        // Continue with next item instead of failing completely
      }
    }

    console.log('\n🎉 Sample data seeding completed!');
    console.log('\n📋 Summary:');
    console.log(`- Attempted to create ${sampleItems.length} items`);
    console.log('\n📝 Next steps:');
    console.log('1. Go to Sanity Studio to review and publish the documents');
    console.log('2. Upload images and replace placeholder references');
    console.log('3. Check your website pages for the new content');

  } catch (error) {
    console.error('❌ Error seeding sample data:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedSampleData();