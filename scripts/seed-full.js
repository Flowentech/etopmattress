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

// Complete Gallery Data (6 items)
const galleryItems = [
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
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Productive Home Office',
    slug: { _type: 'slug', current: 'productive-home-office' },
    description: 'Ergonomic home office design with smart storage solutions and proper lighting for maximum productivity.',
    category: 'office',
    tags: ['ergonomic', 'productive', 'modern', 'organized'],
    featured: true,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Serene Outdoor Oasis',
    slug: { _type: 'slug', current: 'serene-outdoor-oasis' },
    description: 'Beautiful outdoor living space with comfortable seating, ambient lighting, and lush greenery.',
    category: 'outdoor',
    tags: ['outdoor', 'serene', 'green', 'lighting'],
    featured: false,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Industrial Loft Design',
    slug: { _type: 'slug', current: 'industrial-loft-design' },
    description: 'Urban loft with exposed brick, metal fixtures, and open-concept living spaces.',
    category: 'living-room',
    tags: ['industrial', 'urban', 'brick', 'open-concept'],
    featured: true,
  }
];

// Complete Landscaping Projects (3 projects)
const landscapingProjects = [
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
    _type: 'landscapingProject',
    _id: uuidv4(),
    title: 'Rooftop Garden Retreat',
    slug: { _type: 'slug', current: 'rooftop-garden-retreat' },
    description: 'Urban rooftop transformation into a lush garden paradise with seating areas and decorative plantings.',
    features: [
      'Custom built-in planters',
      'Drought-resistant plant selection',
      'Water feature installation',
      'Perennial garden design',
      'Outdoor lighting system'
    ],
    price: 'Starting from $25,000',
    category: 'residential',
    isActive: true,
  },
  {
    _type: 'landscapingProject',
    _id: uuidv4(),
    title: 'Retail Store Interior Plants',
    slug: { _type: 'slug', current: 'retail-store-interior-plants' },
    description: 'Strategic plant placement for a high-end retail boutique to enhance customer experience.',
    features: [
      'Statement entrance plants',
      'Hanging plant installations',
      'Window display plantings',
      'Scented plants for ambiance',
      'Bi-weekly maintenance'
    ],
    price: 'Starting from $5,000',
    category: 'commercial',
    isActive: true,
  }
];

// Complete Rental Packages (4 packages)
const rentalPackages = [
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
    _type: 'rentalPackage',
    _id: uuidv4(),
    title: 'Premium Office Suite',
    slug: { _type: 'slug', current: 'premium-office-suite' },
    description: 'Comprehensive plant solution for medium to large offices seeking maximum impact.',
    price: '$899/month',
    duration: '6-month minimum',
    features: [
      '50+ plants of various sizes',
      'Living wall installation',
      'Custom planter design',
      'Bi-weekly maintenance',
      'Seasonal plant rotation',
      'Air quality monitoring'
    ],
    packageType: 'premium',
    isPopular: false,
    isActive: true,
  },
  {
    _type: 'rentalPackage',
    _id: uuidv4(),
    title: 'Executive Desk Collection',
    slug: { _type: 'slug', current: 'executive-desk-collection' },
    description: 'Curated selection of premium plants for executive offices and conference rooms.',
    price: '$199/month',
    duration: 'Monthly subscription',
    features: [
      '5 premium specimen plants',
      'Designer ceramic planters',
      'Weekly maintenance',
      'Plant health monitoring',
      'Custom plant selection'
    ],
    packageType: 'executive',
    isPopular: false,
    isActive: true,
  },
  {
    _type: 'rentalPackage',
    _id: uuidv4(),
    title: 'Event Rental Package',
    slug: { _type: 'slug', current: 'event-rental-package' },
    description: 'Short-term plant rental for weddings, corporate events, and special occasions.',
    price: '$499/event',
    duration: '1-7 days',
    features: [
      'Up to 30 plants',
      'Custom event design',
      'Delivery and setup',
      'Event day support',
      'Next-day pickup'
    ],
    packageType: 'event',
    isPopular: false,
    isActive: true,
  }
];

// Complete Blog Posts (4 posts)
const blogPosts = [
  {
    _type: 'blog',
    _id: uuidv4(),
    title: '10 Low-Maintenance Plants Perfect for Busy Professionals',
    slug: { _type: 'slug', current: 'low-maintenance-plants-busy-professionals' },
    excerpt: 'Discover the best indoor plants that thrive with minimal care, perfect for busy professionals who want greenery without the hassle.',
    content: `
      <h2>Why Low-Maintenance Plants Matter</h2>
      <p>For busy professionals, maintaining indoor plants can seem like another task on an already long to-do list. However, the benefits of having greenery in your workspace are well-documented - from improved air quality to reduced stress levels.</p>

      <h2>Top 10 Low-Maintenance Plants</h2>
      <h3>1. Snake Plant (Sansevieria)</h3>
      <p>Nearly indestructible and can survive in low light conditions. Water only when the soil is completely dry.</p>

      <h3>2. ZZ Plant (Zamioculcas zamiifolia)</h3>
      <p>Glossy leaves and drought-tolerant nature make it perfect for office environments.</p>

      <h3>3. Pothos (Epipremnum aureum)</h3>
      <p>Versatile and forgiving, tells you when it needs water by slightly drooping.</p>

      <h2>Care Tips</h2>
      <ul>
        <li>Water thoroughly but infrequently</li>
        <li>Choose plants based on your light conditions</li>
        <li>Don't over-fertilize</li>
        <li>Check for pests monthly</li>
      </ul>
    `,
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    isFeatured: true,
  },
  {
    _type: 'blog',
    _id: uuidv4(),
    title: 'The Science Behind Plants and Productivity',
    slug: { _type: 'slug', current: 'science-behind-plants-productivity' },
    excerpt: 'Explore the research-backed benefits of indoor plants on workplace productivity, creativity, and employee wellbeing.',
    content: `
      <h2>The Research Speaks Volumes</h2>
      <p>Multiple studies have demonstrated the positive impact of indoor plants on workplace productivity and employee wellbeing.</p>

      <h2>Key Findings</h2>
      <h3>Improved Air Quality</h3>
      <p>NASA research shows that common houseplants can remove up to 87% of air toxins in 24 hours.</p>

      <h3>Enhanced Productivity</h3>
      <p>Studies show offices with plants see a 15% increase in productivity compared to plant-free spaces.</p>

      <h3>Reduced Stress</h3>
      <p>Interaction with indoor plants can reduce physiological and psychological stress.</p>

      <h2>Implementing in Your Office</h2>
      <p>Start with one plant per employee and gradually increase based on feedback and space availability.</p>
    `,
    publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    isFeatured: false,
  },
  {
    _type: 'blog',
    _id: uuidv4(),
    title: 'Creating a Plant Care Schedule That Works',
    slug: { _type: 'slug', current: 'creating-plant-care-schedule' },
    excerpt: 'Learn how to establish a sustainable plant care routine that keeps your indoor garden thriving without overwhelming your schedule.',
    content: `
      <h2>Why a Schedule Matters</h2>
      <p>Consistency is key to successful plant care. A well-planned schedule ensures your plants get the attention they need while fitting into your busy lifestyle.</p>

      <h2>Building Your Schedule</h2>
      <h3>Daily Tasks (2 minutes)</h3>
      <ul>
        <li>Quick visual check of all plants</li>
        <li>Remove any dead leaves</li>
        <li>Check for obvious issues</li>
      </ul>

      <h3>Weekly Tasks (15-30 minutes)</h3>
      <ul>
        <li>Water plants that need it</li>
        <li>Rotate plants for even growth</li>
        <li>Dust leaves if needed</li>
      </ul>

      <h3>Monthly Tasks (1 hour)</h3>
      <ul>
        <li>Fertilize during growing season</li>
        <li>Prune and shape plants</li>
        <li>Check for pests</li>
        <li>Repot if necessary</li>
      </ul>
    `,
    publishedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    isFeatured: false,
  },
  {
    _type: 'blog',
    _id: uuidv4(),
    title: 'Choosing the Right Plants for Your Office Lighting',
    slug: { _type: 'slug', current: 'choosing-plants-office-lighting' },
    excerpt: 'A comprehensive guide to selecting indoor plants based on your office lighting conditions, from dark corners to bright windows.',
    content: `
      <h2>Understanding Light Conditions</h2>
      <p>The most critical factor in plant success is matching the plant to your available light conditions.</p>

      <h2>Low Light Plants</h2>
      <p>Perfect for offices without windows or far from natural light sources:</p>
      <ul>
        <li>Snake Plant</li>
        <li>ZZ Plant</li>
        <li>Cast Iron Plant</li>
        <li>Peace Lily</li>
      </ul>

      <h2>Medium Light Plants</h2>
      <p>Ideal for offices with some natural light:</p>
      <ul>
        <li>Pothos</li>
        <li>Spider Plant</li>
        <li>Philodendron</li>
        <li>Dracaena</li>
      </ul>

      <h2>Bright Light Plants</h2>
      <p>For offices with good natural light:</p>
      <ul>
        <li>Fiddle Leaf Fig</li>
        <li>Rubber Plant</li>
        <li>Bird of Paradise</li>
        <li>Succulents and Cacti</li>
      </ul>
    `,
    publishedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    isFeatured: true,
  }
];

// Supporting data
const blogCategories = [
  {
    _type: 'blogCategory',
    _id: uuidv4(),
    title: 'Care Tips',
    description: 'Plant care guides and maintenance tips'
  },
  {
    _type: 'blogCategory',
    _id: uuidv4(),
    title: 'Office Plants',
    description: 'Plants suitable for office environments'
  },
  {
    _type: 'blogCategory',
    _id: uuidv4(),
    title: 'Research',
    description: 'Scientific studies on plant benefits'
  },
  {
    _type: 'blogCategory',
    _id: uuidv4(),
    title: 'Workplace',
    description: 'Office design and workplace wellness'
  },
  {
    _type: 'blogCategory',
    _id: uuidv4(),
    title: 'Beginner',
    description: 'Guides for plant care beginners'
  }
];

const authors = [
  {
    _type: 'author',
    _id: uuidv4(),
    name: 'Jane Doe',
    bio: 'Plant care specialist with over 10 years of experience in interior landscaping and corporate plant design.'
  },
  {
    _type: 'author',
    _id: uuidv4(),
    name: 'John Smith',
    bio: 'Horticultural researcher and writer focusing on the intersection of plants and workplace productivity.'
  }
];

// Complete seeding function
async function seedFullData() {
  try {
    console.log('🌱 Starting full sample data seeding...');

    // Test connection first
    console.log('🧪 Testing Sanity connection...');
    const testQuery = '*[_type == "gallery"][0...1]';
    const existing = await client.fetch(testQuery);
    console.log(`✅ Connection successful - Found ${existing.length} existing gallery items`);

    let successCount = 0;
    let errorCount = 0;

    // Function to create items with error handling
    const createItems = async (items, type) => {
      console.log(`\n📝 Creating ${type}s (${items.length} items)...`);
      for (const item of items) {
        try {
          const result = await client.createIfNotExists(item);
          console.log(`✅ Created ${type}: ${item.title}`);
          successCount++;
        } catch (error) {
          console.error(`❌ Error creating ${item.title}:`, error.message);
          errorCount++;
        }
      }
    };

    // Create in the right order (dependencies first)
    await createItems(authors, 'author');
    await createItems(blogCategories, 'blogCategory');
    await createItems(galleryItems, 'gallery');
    await createItems(landscapingProjects, 'landscapingProject');
    await createItems(rentalPackages, 'rentalPackage');
    await createItems(blogPosts, 'blog');

    console.log('\n🎉 Full sample data seeding completed!');
    console.log('\n📋 Summary:');
    console.log(`✅ Successfully created: ${successCount} items`);
    console.log(`❌ Errors encountered: ${errorCount} items`);
    console.log('\n📊 Content breakdown:');
    console.log(`- Gallery: ${galleryItems.length} items`);
    console.log(`- Landscaping Projects: ${landscapingProjects.length} items`);
    console.log(`- Rental Packages: ${rentalPackages.length} items`);
    console.log(`- Blog Posts: ${blogPosts.length} items`);
    console.log(`- Authors: ${authors.length} items`);
    console.log(`- Blog Categories: ${blogCategories.length} items`);
    console.log(`- Total: ${galleryItems.length + landscapingProjects.length + rentalPackages.length + blogPosts.length + authors.length + blogCategories.length} items`);

    console.log('\n📝 Next steps:');
    console.log('1. Go to Sanity Studio to review and publish the documents');
    console.log('2. Upload images and replace placeholder references');
    console.log('3. Check your website pages for the new content');
    console.log('\n🚀 Your Gallery, Interior Solutions, and Tips sections are now populated!');

  } catch (error) {
    console.error('❌ Error seeding sample data:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedFullData();