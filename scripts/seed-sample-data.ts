// Sample data seeding script for Gallery, Interior Solutions, and Tips
// Run this script to populate your Sanity CMS with sample content

import { client } from '../sanity/lib/client';
import { v4 as uuidv4 } from 'uuid';

// Sample Gallery Data
const galleryItems = [
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Modern Living Room Transformation',
    slug: {
      _type: 'slug',
      current: 'modern-living-room-transformation'
    },
    description: 'A stunning transformation of a traditional living room into a modern, minimalist space with clean lines and neutral colors.',
    image: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: 'image-placeholder-1' // Replace with actual image reference
      }
    },
    category: 'living-room',
    tags: ['modern', 'minimalist', 'neutral', 'contemporary'],
    featured: true,
    createdAt: new Date().toISOString(),
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Luxury Kitchen Makeover',
    slug: {
      _type: 'slug',
      current: 'luxury-kitchen-makeover'
    },
    description: 'High-end kitchen renovation featuring marble countertops, custom cabinetry, and state-of-the-art appliances.',
    image: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: 'image-placeholder-2'
      }
    },
    category: 'kitchen',
    tags: ['luxury', 'marble', 'custom', 'modern'],
    featured: true,
    createdAt: new Date().toISOString(),
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Cozy Bedroom Retreat',
    slug: {
      _type: 'slug',
      current: 'cozy-bedroom-retreat'
    },
    description: 'A peaceful bedroom design with warm colors, soft textures, and optimal lighting for relaxation.',
    image: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: 'image-placeholder-3'
      }
    },
    category: 'bedroom',
    tags: ['cozy', 'warm', 'relaxing', 'traditional'],
    featured: false,
    createdAt: new Date().toISOString(),
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Productive Home Office',
    slug: {
      _type: 'slug',
      current: 'productive-home-office'
    },
    description: 'Ergonomic home office design with smart storage solutions and proper lighting for maximum productivity.',
    image: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: 'image-placeholder-4'
      }
    },
    category: 'office',
    tags: ['ergonomic', 'productive', 'modern', 'organized'],
    featured: true,
    createdAt: new Date().toISOString(),
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Serene Outdoor Oasis',
    slug: {
      _type: 'slug',
      current: 'serene-outdoor-oasis'
    },
    description: 'Beautiful outdoor living space with comfortable seating, ambient lighting, and lush greenery.',
    image: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: 'image-placeholder-5'
      }
    },
    category: 'outdoor',
    tags: ['outdoor', 'serene', 'green', 'lighting'],
    featured: false,
    createdAt: new Date().toISOString(),
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Industrial Loft Design',
    slug: {
      _type: 'slug',
      current: 'industrial-loft-design'
    },
    description: 'Urban loft with exposed brick, metal fixtures, and open-concept living spaces.',
    image: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: 'image-placeholder-6'
      }
    },
    category: 'living-room',
    tags: ['industrial', 'urban', 'brick', 'open-concept'],
    featured: true,
    createdAt: new Date().toISOString(),
  }
];

// Sample Landscaping Projects
const landscapingProjects = [
  {
    _type: 'landscapingProject',
    _id: uuidv4(),
    title: 'Corporate Office Green Space',
    slug: {
      _type: 'slug',
      current: 'corporate-office-green-space'
    },
    description: 'Complete interior plant design for a corporate office environment featuring living walls and desktop planters.',
    detailedDescription: 'This comprehensive office greening project transformed a sterile corporate environment into a vibrant, biophilic workspace. The design includes a 20-foot living wall in the reception area, custom desktop planters for each workstation, and strategic plant placement throughout common areas to improve air quality and employee wellbeing.',
    image: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: 'landscape-placeholder-1'
      }
    },
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
    createdAt: new Date().toISOString(),
  },
  {
    _type: 'landscapingProject',
    _id: uuidv4(),
    title: 'Rooftop Garden Retreat',
    slug: {
      _type: 'slug',
      current: 'rooftop-garden-retreat'
    },
    description: 'Urban rooftop transformation into a lush garden paradise with seating areas and decorative plantings.',
    detailedDescription: 'An ambitious rooftop garden project that converted an unused 2000 sq ft rooftop into a stunning outdoor oasis. Features include custom planters, drought-resistant plants, a small water feature, and comfortable seating areas for year-round enjoyment.',
    image: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: 'landscape-placeholder-2'
      }
    },
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
    createdAt: new Date().toISOString(),
  },
  {
    _type: 'landscapingProject',
    _id: uuidv4(),
    title: 'Retail Store Interior Plants',
    slug: {
      _type: 'slug',
      current: 'retail-store-interior-plants'
    },
    description: 'Strategic plant placement for a high-end retail boutique to enhance customer experience.',
    detailedDescription: 'A boutique retail space enhanced with carefully selected plants that complement the brand aesthetic while improving the shopping environment. The design features statement plants, hanging installations, and window displays that draw customers in.',
    image: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: 'landscape-placeholder-3'
      }
    },
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
    createdAt: new Date().toISOString(),
  }
];

// Sample Rental Packages
const rentalPackages = [
  {
    _type: 'rentalPackage',
    _id: uuidv4(),
    title: 'Starter Office Package',
    slug: {
      _type: 'slug',
      current: 'starter-office-package'
    },
    description: 'Perfect for small offices and startups looking to add greenery without maintenance hassle.',
    detailedDescription: 'Our most popular rental package for small offices. Includes 20 desk plants, 4 floor plants, and quarterly maintenance. All plants are selected for their low-maintenance requirements and air-purifying qualities.',
    image: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: 'package-starter'
      }
    },
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
    createdAt: new Date().toISOString(),
  },
  {
    _type: 'rentalPackage',
    _id: uuidv4(),
    title: 'Premium Office Suite',
    slug: {
      _type: 'slug',
      current: 'premium-office-suite'
    },
    description: 'Comprehensive plant solution for medium to large offices seeking maximum impact.',
    detailedDescription: 'Complete office greening solution with living walls, custom planters, and bi-weekly maintenance. Perfect for companies wanting to create a impressive, healthy workspace that boosts employee productivity and wellbeing.',
    image: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: 'package-premium'
      }
    },
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
    createdAt: new Date().toISOString(),
  },
  {
    _type: 'rentalPackage',
    _id: uuidv4(),
    title: 'Executive Desk Collection',
    slug: {
      _type: 'slug',
      current: 'executive-desk-collection'
    },
    description: 'Curated selection of premium plants for executive offices and conference rooms.',
    detailedDescription: 'High-end plant collection featuring specimen plants and designer planters perfect for executive spaces. Includes specialized care for rare and exotic plants that make a statement.',
    image: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: 'package-executive'
      }
    },
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
    createdAt: new Date().toISOString(),
  },
  {
    _type: 'rentalPackage',
    _id: uuidv4(),
    title: 'Event Rental Package',
    slug: {
      _type: 'slug',
      current: 'event-rental-package'
    },
    description: 'Short-term plant rental for weddings, corporate events, and special occasions.',
    detailedDescription: 'Beautiful plant rentals for special events and occasions. Choose from our curated selection or let us design custom arrangements for your event. Delivery, setup, and pickup included.',
    image: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: 'package-event'
      }
    },
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
    createdAt: new Date().toISOString(),
  }
];

// Sample Blog Posts (Tips)
const blogPosts = [
  {
    _type: 'blog',
    _id: uuidv4(),
    title: '10 Low-Maintenance Plants Perfect for Busy Professionals',
    slug: {
      _type: 'slug',
      current: 'low-maintenance-plants-busy-professionals'
    },
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
    coverImage: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: 'blog-cover-low-maintenance'
      }
    },
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    author: {
      _type: 'reference',
      _ref: 'author-jane-doe' // Reference to an author document
    },
    categories: [
      { _type: 'reference', _ref: 'category-care-tips' },
      { _type: 'reference', _ref: 'category-office-plants' }
    ],
    isFeatured: true,
  },
  {
    _type: 'blog',
    _id: uuidv4(),
    title: 'The Science Behind Plants and Productivity',
    slug: {
      _type: 'slug',
      current: 'science-behind-plants-productivity'
    },
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
    coverImage: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: 'blog-cover-productivity'
      }
    },
    publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
    author: {
      _type: 'reference',
      _ref: 'author-john-smith'
    },
    categories: [
      { _type: 'reference', _ref: 'category-research' },
      { _type: 'reference', _ref: 'category-workplace' }
    ],
    isFeatured: false,
  },
  {
    _type: 'blog',
    _id: uuidv4(),
    title: 'Creating a Plant Care Schedule That Works',
    slug: {
      _type: 'slug',
      current: 'creating-plant-care-schedule'
    },
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

      <h2>Tools and Reminders</h2>
      <p>Use calendar apps, plant care apps, or simple checklists to stay on track with your plant care routine.</p>
    `,
    coverImage: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: 'blog-cover-schedule'
      }
    },
    publishedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days ago
    author: {
      _type: 'reference',
      _ref: 'author-jane-doe'
    },
    categories: [
      { _type: 'reference', _ref: 'category-care-tips' },
      { _type: 'reference', _ref: 'category-beginner' }
    ],
    isFeatured: false,
  },
  {
    _type: 'blog',
    _id: uuidv4(),
    title: 'Choosing the Right Plants for Your Office Lighting',
    slug: {
      _type: 'slug',
      current: 'choosing-plants-office-lighting'
    },
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

      <h2>Artificial Lighting Solutions</h2>
      <p>Consider grow lights for spaces with insufficient natural light.</p>
    `,
    coverImage: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: 'blog-cover-lighting'
      }
    },
    publishedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    author: {
      _type: 'reference',
      _ref: 'author-john-smith'
    },
    categories: [
      { _type: 'reference', _ref: 'category-care-tips' },
      { _type: 'reference', _ref: 'category-office-plants' }
    ],
    isFeatured: true,
  }
];

// Sample Author Data
const authors = [
  {
    _type: 'author',
    _id: 'author-jane-doe',
    name: 'Jane Doe',
    image: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: 'author-jane-image'
      }
    },
    bio: 'Plant care specialist with over 10 years of experience in interior landscaping and corporate plant design.'
  },
  {
    _type: 'author',
    _id: 'author-john-smith',
    name: 'John Smith',
    image: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: 'author-john-image'
      }
    },
    bio: 'Horticultural researcher and writer focusing on the intersection of plants and workplace productivity.'
  }
];

// Sample Category Data
const categories = [
  {
    _type: 'blogCategory',
    _id: 'category-care-tips',
    title: 'Care Tips',
    description: 'Plant care guides and maintenance tips'
  },
  {
    _type: 'blogCategory',
    _id: 'category-office-plants',
    title: 'Office Plants',
    description: 'Plants suitable for office environments'
  },
  {
    _type: 'blogCategory',
    _id: 'category-research',
    title: 'Research',
    description: 'Scientific studies on plant benefits'
  },
  {
    _type: 'blogCategory',
    _id: 'category-workplace',
    title: 'Workplace',
    description: 'Office design and workplace wellness'
  },
  {
    _type: 'blogCategory',
    _id: 'category-beginner',
    title: 'Beginner',
    description: 'Guides for plant care beginners'
  }
];

// Function to create sample data
export async function seedSampleData() {
  try {
    console.log('🌱 Starting to seed sample data...');

    // Create authors first (they're referenced by blogs)
    console.log('📝 Creating authors...');
    for (const author of authors) {
      try {
        await client.createIfNotExists(author);
        console.log(`✅ Created author: ${author.name}`);
      } catch (error) {
        console.error(`❌ Error creating author ${author.name}:`, error);
      }
    }

    // Create categories
    console.log('📂 Creating categories...');
    for (const category of categories) {
      try {
        await client.createIfNotExists(category);
        console.log(`✅ Created category: ${category.title}`);
      } catch (error) {
        console.error(`❌ Error creating category ${category.title}:`, error);
      }
    }

    // Create gallery items
    console.log('🖼️ Creating gallery items...');
    for (const item of galleryItems) {
      try {
        await client.createIfNotExists(item);
        console.log(`✅ Created gallery item: ${item.title}`);
      } catch (error) {
        console.error(`❌ Error creating gallery item ${item.title}:`, error);
      }
    }

    // Create landscaping projects
    console.log('🌿 Creating landscaping projects...');
    for (const project of landscapingProjects) {
      try {
        await client.createIfNotExists(project);
        console.log(`✅ Created project: ${project.title}`);
      } catch (error) {
        console.error(`❌ Error creating project ${project.title}:`, error);
      }
    }

    // Create rental packages
    console.log('📦 Creating rental packages...');
    for (const pkg of rentalPackages) {
      try {
        await client.createIfNotExists(pkg);
        console.log(`✅ Created package: ${pkg.title}`);
      } catch (error) {
        console.error(`❌ Error creating package ${pkg.title}:`, error);
      }
    }

    // Create blog posts
    console.log('📄 Creating blog posts...');
    for (const blog of blogPosts) {
      try {
        await client.createIfNotExists(blog);
        console.log(`✅ Created blog: ${blog.title}`);
      } catch (error) {
        console.error(`❌ Error creating blog ${blog.title}:`, error);
      }
    }

    console.log('🎉 Sample data seeding completed!');
    console.log('\n📋 Summary:');
    console.log(`- ${galleryItems.length} gallery items`);
    console.log(`- ${landscapingProjects.length} landscaping projects`);
    console.log(`- ${rentalPackages.length} rental packages`);
    console.log(`- ${blogPosts.length} blog posts`);
    console.log(`- ${authors.length} authors`);
    console.log(`- ${categories.length} categories`);

  } catch (error) {
    console.error('❌ Error seeding sample data:', error);
  }
}

// Export individual datasets for selective seeding
export { galleryItems, landscapingProjects, rentalPackages, blogPosts, authors, categories };

// Run the seeding function if this script is executed directly
if (require.main === module) {
  seedSampleData();
}