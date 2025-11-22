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

// Expanded Gallery Data (50 items)
const galleryItems = [
  // Living Room Designs (10)
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Modern Minimalist Living Room',
    slug: { _type: 'slug', current: 'modern-minimalist-living-room' },
    description: 'Clean lines and neutral colors create a serene living space with minimal furniture and maximum impact.',
    category: 'living-room',
    tags: ['modern', 'minimalist', 'neutral', 'clean'],
    featured: true,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Scandinavian Inspired Living Space',
    slug: { _type: 'slug', current: 'scandinavian-living-space' },
    description: 'Cozy yet sophisticated living room featuring light woods, natural textiles, and functional design.',
    category: 'living-room',
    tags: ['scandinavian', 'cozy', 'natural', 'functional'],
    featured: true,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Industrial Loft Living Room',
    slug: { _type: 'slug', current: 'industrial-loft-living-room' },
    description: 'Urban loft design with exposed brick, metal fixtures, and high ceilings creating an industrial-chic atmosphere.',
    category: 'living-room',
    tags: ['industrial', 'urban', 'brick', 'high-ceiling'],
    featured: false,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Bohemian Eclectic Living Room',
    slug: { _type: 'slug', current: 'bohemian-eclectic-living-room' },
    description: 'Vibrant mix of patterns, textures, and colors creating a free-spirited, personalized living space.',
    category: 'living-room',
    tags: ['bohemian', 'eclectic', 'vibrant', 'personalized'],
    featured: false,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Mid-Century Modern Living Room',
    slug: { _type: 'slug', current: 'mid-century-modern-living-room' },
    description: 'Retro-inspired design with teak furniture, geometric patterns, and warm wood tones.',
    category: 'living-room',
    tags: ['mid-century', 'retro', 'teak', 'geometric'],
    featured: true,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Coastal Beach House Living Room',
    slug: { _type: 'slug', current: 'coastal-beach-house-living-room' },
    description: 'Breezy coastal design with soft blues, natural textures, and relaxed beach house vibes.',
    category: 'living-room',
    tags: ['coastal', 'beach', 'blue', 'relaxed'],
    featured: false,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Art Deco Glamour Living Room',
    slug: { _type: 'slug', current: 'art-deco-glamour-living-room' },
    description: 'Luxurious Art Deco design featuring rich colors, metallic accents, and geometric patterns.',
    category: 'living-room',
    tags: ['art-deco', 'glamorous', 'metallic', 'geometric'],
    featured: false,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Rustic Farmhouse Living Room',
    slug: { _type: 'slug', current: 'rustic-farmhouse-living-room' },
    description: 'Warm and inviting farmhouse design with reclaimed wood, vintage finds, and comfortable furnishings.',
    category: 'living-room',
    tags: ['rustic', 'farmhouse', 'reclaimed-wood', 'vintage'],
    featured: false,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Contemporary Urban Living Room',
    slug: { _type: 'slug', current: 'contemporary-urban-living-room' },
    description: 'Sophisticated urban living space with modern art, sleek furniture, and city-inspired decor.',
    category: 'living-room',
    tags: ['contemporary', 'urban', 'modern-art', 'sleek'],
    featured: false,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Traditional Elegance Living Room',
    slug: { _type: 'slug', current: 'traditional-elegance-living-room' },
    description: 'Timeless traditional design with classic furniture, rich fabrics, and elegant accessories.',
    category: 'living-room',
    tags: ['traditional', 'elegant', 'classic', 'rich-fabrics'],
    featured: false,
  },

  // Kitchen Designs (8)
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Modern Minimalist Kitchen',
    slug: { _type: 'slug', current: 'modern-minimalist-kitchen' },
    description: 'Sleek minimalist kitchen with handleless cabinets, integrated appliances, and clean surfaces.',
    category: 'kitchen',
    tags: ['modern', 'minimalist', 'handleless', 'integrated'],
    featured: true,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Farmhouse Country Kitchen',
    slug: { _type: 'slug', current: 'farmhouse-country-kitchen' },
    description: 'Charming farmhouse kitchen with shaker cabinets, farmhouse sink, and warm country elements.',
    category: 'kitchen',
    tags: ['farmhouse', 'country', 'shaker-cabinets', 'warm'],
    featured: false,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Industrial Loft Kitchen',
    slug: { _type: 'slug', current: 'industrial-loft-kitchen' },
    description: 'Raw industrial kitchen with exposed pipes, concrete countertops, and stainless steel appliances.',
    category: 'kitchen',
    tags: ['industrial', 'exposed-pipes', 'concrete', 'stainless-steel'],
    featured: false,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Scandinavian Kitchen Design',
    slug: { _type: 'slug', current: 'scandinavian-kitchen-design' },
    description: 'Bright and airy Scandinavian kitchen with white cabinets, wood accents, and functional layout.',
    category: 'kitchen',
    tags: ['scandinavian', 'bright', 'white-cabinets', 'functional'],
    featured: true,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Luxury Marble Kitchen',
    slug: { _type: 'slug', current: 'luxury-marble-kitchen' },
    description: 'High-end luxury kitchen featuring marble countertops, custom cabinetry, and premium appliances.',
    category: 'kitchen',
    tags: ['luxury', 'marble', 'custom', 'premium'],
    featured: false,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Small Space Efficient Kitchen',
    slug: { _type: 'slug', current: 'small-space-efficient-kitchen' },
    description: 'Clever small kitchen design with smart storage solutions and space-saving appliances.',
    category: 'kitchen',
    tags: ['small-space', 'efficient', 'smart-storage', 'compact'],
    featured: false,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Mediterranean Kitchen',
    slug: { _type: 'slug', current: 'mediterranean-kitchen' },
    description: 'Warm Mediterranean kitchen with terracotta tiles, wrought iron details, and rustic charm.',
    category: 'kitchen',
    tags: ['mediterranean', 'terracotta', 'wrought-iron', 'rustic'],
    featured: false,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Transitional Kitchen Design',
    slug: { _type: 'slug', current: 'transitional-kitchen-design' },
    description: 'Perfect blend of traditional and modern elements creating a timeless kitchen space.',
    category: 'kitchen',
    tags: ['transitional', 'traditional-modern', 'timeless', 'balanced'],
    featured: false,
  },

  // Bedroom Designs (10)
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Serene Master Bedroom Retreat',
    slug: { _type: 'slug', current: 'serene-master-bedroom-retreat' },
    description: 'Peaceful master bedroom with soft colors, plush textures, and calming atmosphere.',
    category: 'bedroom',
    tags: ['serene', 'master-bedroom', 'soft-colors', 'calming'],
    featured: true,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Modern Minimalist Bedroom',
    slug: { _type: 'slug', current: 'modern-minimalist-bedroom' },
    description: 'Clean and minimalist bedroom design with neutral palette and functional furniture.',
    category: 'bedroom',
    tags: ['modern', 'minimalist', 'neutral', 'functional'],
    featured: false,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Bohemian Bedroom Oasis',
    slug: { _type: 'slug', current: 'bohemian-bedroom-oasis' },
    description: 'Eclectic bohemian bedroom with vibrant textiles, plants, and artistic elements.',
    category: 'bedroom',
    tags: ['bohemian', 'eclectic', 'vibrant', 'artistic'],
    featured: false,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Luxury Hotel-Style Bedroom',
    slug: { _type: 'slug', current: 'luxury-hotel-style-bedroom' },
    description: 'Elegant bedroom inspired by luxury hotels with premium bedding and sophisticated decor.',
    category: 'bedroom',
    tags: ['luxury', 'hotel-style', 'premium-bedding', 'sophisticated'],
    featured: true,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Small Space Bedroom Solution',
    slug: { _type: 'slug', current: 'small-space-bedroom-solution' },
    description: 'Smart small bedroom design with multifunctional furniture and clever storage.',
    category: 'bedroom',
    tags: ['small-space', 'multifunctional', 'clever-storage', 'compact'],
    featured: false,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Coastal Beach Bedroom',
    slug: { _type: 'slug', current: 'coastal-beach-bedroom' },
    description: 'Relaxing coastal bedroom with beach-inspired colors and natural textures.',
    category: 'bedroom',
    tags: ['coastal', 'beach-inspired', 'natural-textures', 'relaxing'],
    featured: false,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Industrial Loft Bedroom',
    slug: { _type: 'slug', current: 'industrial-loft-bedroom' },
    description: 'Edgy industrial bedroom with exposed elements, metal accents, and urban vibe.',
    category: 'bedroom',
    tags: ['industrial', 'exposed-elements', 'metal-accents', 'urban'],
    featured: false,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Traditional Country Bedroom',
    slug: { _type: 'slug', current: 'traditional-country-bedroom' },
    description: 'Cozy country bedroom with antique furniture, floral patterns, and rustic charm.',
    category: 'bedroom',
    tags: ['traditional', 'country', 'antique', 'floral-patterns'],
    featured: false,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Contemporary Platform Bedroom',
    slug: { _type: 'slug', current: 'contemporary-platform-bedroom' },
    description: 'Modern platform bedroom with sleek design and integrated storage solutions.',
    category: 'bedroom',
    tags: ['contemporary', 'platform-bed', 'sleek', 'integrated-storage'],
    featured: false,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Scandinavian Minimalist Bedroom',
    slug: { _type: 'slug', current: 'scandinavian-minimalist-bedroom' },
    description: 'Light and airy Scandinavian bedroom with natural materials and functional design.',
    category: 'bedroom',
    tags: ['scandinavian', 'minimalist', 'natural-materials', 'functional'],
    featured: false,
  },

  // Bathroom Designs (6)
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Modern Spa Bathroom',
    slug: { _type: 'slug', current: 'modern-spa-bathroom' },
    description: 'Luxurious spa-like bathroom with modern fixtures and relaxing atmosphere.',
    category: 'bathroom',
    tags: ['modern', 'spa-like', 'luxurious', 'relaxing'],
    featured: true,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Small Bathroom Makeover',
    slug: { _type: 'slug', current: 'small-bathroom-makeover' },
    description: 'Efficient small bathroom design with smart storage and space optimization.',
    category: 'bathroom',
    tags: ['small-bathroom', 'efficient', 'smart-storage', 'space-optimized'],
    featured: false,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Industrial Concrete Bathroom',
    slug: { _type: 'slug', current: 'industrial-concrete-bathroom' },
    description: 'Edgy industrial bathroom with concrete surfaces, metal fixtures, and raw aesthetics.',
    category: 'bathroom',
    tags: ['industrial', 'concrete', 'metal-fixtures', 'raw-aesthetics'],
    featured: false,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Vintage Farmhouse Bathroom',
    slug: { _type: 'slug', current: 'vintage-farmhouse-bathroom' },
    description: 'Charming farmhouse bathroom with vintage fixtures, shiplap walls, and rustic details.',
    category: 'bathroom',
    tags: ['vintage', 'farmhouse', 'shiplap', 'rustic'],
    featured: false,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Luxury Marble Bathroom',
    slug: { _type: 'slug', current: 'luxury-marble-bathroom' },
    description: 'Opulent bathroom featuring marble surfaces, freestanding tub, and premium fixtures.',
    category: 'bathroom',
    tags: ['luxury', 'marble', 'freestanding-tub', 'premium'],
    featured: false,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Tropical Resort Bathroom',
    slug: { _type: 'slug', current: 'tropical-resort-bathroom' },
    description: 'Resort-style bathroom with tropical plants, natural materials, and vacation vibes.',
    category: 'bathroom',
    tags: ['tropical', 'resort-style', 'natural-materials', 'vacation-vibes'],
    featured: false,
  },

  // Office Designs (8)
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Productive Home Office Setup',
    slug: { _type: 'slug', current: 'productive-home-office-setup' },
    description: 'Ergonomic home office designed for maximum productivity and comfort.',
    category: 'office',
    tags: ['productive', 'home-office', 'ergonomic', 'comfortable'],
    featured: true,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Modern Executive Office',
    slug: { _type: 'slug', current: 'modern-executive-office' },
    description: 'Sophisticated executive office with modern furniture and professional atmosphere.',
    category: 'office',
    tags: ['executive', 'modern', 'professional', 'sophisticated'],
    featured: false,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Creative Studio Workspace',
    slug: { _type: 'slug', current: 'creative-studio-workspace' },
    description: 'Inspiring creative studio with flexible layout and artistic elements.',
    category: 'office',
    tags: ['creative', 'studio', 'flexible', 'artistic'],
    featured: false,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Minimalist Office Design',
    slug: { _type: 'slug', current: 'minimalist-office-design' },
    description: 'Clean minimalist office with essential furniture and distraction-free environment.',
    category: 'office',
    tags: ['minimalist', 'clean', 'essential', 'distraction-free'],
    featured: false,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Industrial Loft Office',
    slug: { _type: 'slug', current: 'industrial-loft-office' },
    description: 'Urban industrial office with exposed elements and creative workspace design.',
    category: 'office',
    tags: ['industrial', 'urban', 'exposed-elements', 'creative'],
    featured: false,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Co-Working Space Design',
    slug: { _type: 'slug', current: 'co-working-space-design' },
    description: 'Modern co-working space with collaborative areas and flexible workstations.',
    category: 'office',
    tags: ['co-working', 'collaborative', 'flexible', 'modern'],
    featured: false,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Scandinavian Home Office',
    slug: { _type: 'slug', current: 'scandinavian-home-office' },
    description: 'Light and airy Scandinavian home office with natural materials and functional design.',
    category: 'office',
    tags: ['scandinavian', 'light', 'natural-materials', 'functional'],
    featured: false,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Luxury Corner Office',
    slug: { _type: 'slug', current: 'luxury-corner-office' },
    description: 'High-end corner office with premium furniture and city views.',
    category: 'office',
    tags: ['luxury', 'corner-office', 'premium', 'city-views'],
    featured: false,
  },

  // Outdoor & Dining Designs (8)
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Modern Outdoor Living Room',
    slug: { _type: 'slug', current: 'modern-outdoor-living-room' },
    description: 'Stylish outdoor living space with modern furniture and comfortable seating areas.',
    category: 'outdoor',
    tags: ['modern', 'outdoor-living', 'stylish', 'comfortable'],
    featured: true,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Rooftop Garden Entertainment Area',
    slug: { _type: 'slug', current: 'rooftop-garden-entertainment-area' },
    description: 'Urban rooftop garden perfect for entertaining with dining and lounge areas.',
    category: 'outdoor',
    tags: ['rooftop', 'garden', 'entertainment', 'urban'],
    featured: false,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Cozy Backyard Patio',
    slug: { _type: 'slug', current: 'cozy-backyard-patio' },
    description: 'Inviting backyard patio with comfortable seating and ambient lighting.',
    category: 'outdoor',
    tags: ['backyard', 'patio', 'cozy', 'ambient-lighting'],
    featured: false,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Modern Dining Room Design',
    slug: { _type: 'slug', current: 'modern-dining-room-design' },
    description: 'Elegant dining room with modern table, statement lighting, and sophisticated decor.',
    category: 'dining',
    tags: ['modern', 'dining-room', 'statement-lighting', 'sophisticated'],
    featured: false,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Farmhouse Dining Room',
    slug: { _type: 'slug', current: 'farmhouse-dining-room' },
    description: 'Rustic farmhouse dining room with large harvest table and country charm.',
    category: 'dining',
    tags: ['farmhouse', 'rustic', 'harvest-table', 'country-charm'],
    featured: false,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Small Space Dining Solution',
    slug: { _type: 'slug', current: 'small-space-dining-solution' },
    description: 'Compact dining area with smart furniture and space-saving design.',
    category: 'dining',
    tags: ['small-space', 'compact', 'smart-furniture', 'space-saving'],
    featured: false,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Outdoor Kitchen and Dining',
    slug: { _type: 'slug', current: 'outdoor-kitchen-dining' },
    description: 'Complete outdoor kitchen and dining area perfect for al fresco entertaining.',
    category: 'outdoor',
    tags: ['outdoor-kitchen', 'al-fresco', 'entertaining', 'complete'],
    featured: false,
  },
  {
    _type: 'gallery',
    _id: uuidv4(),
    title: 'Zen Garden Meditation Space',
    slug: { _type: 'slug', current: 'zen-garden-meditation-space' },
    description: 'Peaceful zen garden with meditation area and tranquil atmosphere.',
    category: 'outdoor',
    tags: ['zen', 'garden', 'meditation', 'tranquil'],
    featured: false,
  }
];

// Expanded Interior Solutions (20 total)
const landscapingProjects = [
  // Commercial Projects (10)
  {
    _type: 'landscapingProject',
    _id: uuidv4(),
    title: 'Corporate Headquarters Green Space',
    slug: { _type: 'slug', current: 'corporate-headquarters-green-space' },
    description: 'Complete interior plant design for corporate headquarters featuring living walls and biophilic design elements.',
    features: [
      '30-foot living wall in reception',
      '100+ desk plants across floors',
      'Smart irrigation system',
      'Air quality monitoring',
      'Quarterly maintenance service',
      'Custom planters for meeting rooms'
    ],
    price: 'Starting from $35,000',
    category: 'commercial',
    isActive: true,
  },
  {
    _type: 'landscapingProject',
    _id: uuidv4(),
    title: 'Tech Startup Office Biophilic Design',
    slug: { _type: 'slug', current: 'tech-startup-biophilic-design' },
    description: 'Modern biophilic office design for tech startup with creative plant arrangements and wellness spaces.',
    features: [
      'Moss art installations',
      'Hanging plant systems',
      'Collaboration zone plantings',
      'Living dividers',
      'Wellness room plants',
      'Smart lighting integration'
    ],
    price: 'Starting from $22,000',
    category: 'commercial',
    isActive: true,
  },
  {
    _type: 'landscapingProject',
    _id: uuidv4(),
    title: 'Financial Institution Professional Plants',
    slug: { _type: 'slug', current: 'financial-institution-plants' },
    description: 'Sophisticated plant design for financial institution with elegant, low-maintenance plant selections.',
    features: [
      'Executive office specimen plants',
      'Reception area formal plantings',
      'Conference room plant arrangements',
      'Private office desk plants',
      'Monthly maintenance service',
      'Seasonal rotation program'
    ],
    price: 'Starting from $18,000',
    category: 'commercial',
    isActive: true,
  },
  {
    _type: 'landscapingProject',
    _id: uuidv4(),
    title: 'Healthcare Facility Healing Gardens',
    slug: { _type: 'slug', current: 'healthcare-healing-gardens' },
    description: 'Therapeutic plant design for healthcare facility with healing gardens and patient wellness areas.',
    features: [
      'Non-toxic plant selection',
      'Sensory garden elements',
      'Waiting room plantings',
      'Recovery area plants',
      'Staff relaxation spaces',
      'Medical-grade maintenance'
    ],
    price: 'Starting from $28,000',
    category: 'commercial',
    isActive: true,
  },
  {
    _type: 'landscapingProject',
    _id: uuidv4(),
    title: 'Hotel Lobby Biophilic Design',
    slug: { _type: 'slug', current: 'hotel-lobby-biophilic-design' },
    description: 'Luxury hotel lobby with impressive living wall and tropical plant installations.',
    features: [
      '40-foot tropical living wall',
      'Custom planter designs',
      'Hotel room plant packages',
      'Restaurant area plantings',
      'Spa plant installations',
      'Daily maintenance service'
    ],
    price: 'Starting from $45,000',
    category: 'commercial',
    isActive: true,
  },
  {
    _type: 'landscapingProject',
    _id: uuidv4(),
    title: 'Shopping Mall Green Spaces',
    slug: { _type: 'slug', current: 'shopping-mall-green-spaces' },
    description: 'Large-scale plant installations for shopping mall common areas and retail spaces.',
    features: [
      'Central atrium plantings',
      'Entrance garden designs',
      'Food court plant arrangements',
      'Rest area green spaces',
      'Seasonal decoration integration',
      'Bi-weekly maintenance'
    ],
    price: 'Starting from $40,000',
    category: 'commercial',
    isActive: true,
  },
  {
    _type: 'landscapingProject',
    _id: uuidv4(),
    title: 'University Campus Plant Design',
    slug: { _type: 'slug', current: 'university-campus-plant-design' },
    description: 'Educational facility plant design focusing on learning environments and student spaces.',
    features: [
      'Library plant installations',
      'Study area plantings',
      'Lecture hall greenery',
      'Student lounge plants',
      'Administrative office plants',
      'Academic calendar maintenance'
    ],
    price: 'Starting from $25,000',
    category: 'commercial',
    isActive: true,
  },
  {
    _type: 'landscapingProject',
    _id: uuidv4(),
    title: 'Restaurant Interior Garden',
    slug: { _type: 'slug', current: 'restaurant-interior-garden' },
    description: 'Dining restaurant with indoor herb garden and atmospheric plant design.',
    features: [
      'Edible herb wall',
      'Dining area plant separators',
      'Entrance plant installations',
      'Bar area plantings',
      'Outdoor patio plants',
      'Weekly harvesting service'
    ],
    price: 'Starting from $12,000',
    category: 'commercial',
    isActive: true,
  },
  {
    _type: 'landscapingProject',
    _id: uuidv4(),
    title: 'Co-working Space Biophilic Zones',
    slug: { _type: 'slug', current: 'co-working-biophilic-zones' },
    description: 'Modern co-working space with designated biophilic zones for productivity and wellness.',
    features: [
      'Focus area plants',
      'Collaboration zone plantings',
      'Phone booth greenery',
      'Lounge area plants',
      'Event space plant design',
      'Flexible maintenance plans'
    ],
    price: 'Starting from $15,000',
    category: 'commercial',
    isActive: true,
  },
  {
    _type: 'landscapingProject',
    _id: uuidv4(),
    title: 'Fitness Center Plant Design',
    slug: { _type: 'slug', current: 'fitness-center-plant-design' },
    description: 'Health and wellness facility with air-purifying plants and motivating green spaces.',
    features: [
      'Air-purifying plant selection',
      'Workout area plantings',
      'Lounge relaxation plants',
      'Locker room plants',
      'Entrance motivational design',
      'Bi-weekly maintenance'
    ],
    price: 'Starting from $10,000',
    category: 'commercial',
    isActive: true,
  }
];

const rentalPackages = [
  // Rental Packages (10)
  {
    _type: 'rentalPackage',
    _id: uuidv4(),
    title: 'Basic Office Starter',
    slug: { _type: 'slug', current: 'basic-office-starter' },
    description: 'Perfect entry-level package for small offices and home offices.',
    price: '$149/month',
    duration: '3-month minimum',
    features: [
      '10 desk plants',
      '2 floor plants',
      'Monthly maintenance visits',
      'Basic plant selection',
      'Delivery included'
    ],
    packageType: 'basic',
    isPopular: false,
    isActive: true,
  },
  {
    _type: 'rentalPackage',
    _id: uuidv4(),
    title: 'Professional Office Standard',
    slug: { _type: 'slug', current: 'professional-office-standard' },
    description: 'Most popular package for growing businesses and professional offices.',
    price: '$399/month',
    duration: '3-month minimum',
    features: [
      '25 desk plants',
      '5 floor plants',
      'Bi-weekly maintenance',
      'Premium plant selection',
      'Plant replacement guarantee',
      'Delivery and setup'
    ],
    packageType: 'standard',
    isPopular: true,
    isActive: true,
  },
  {
    _type: 'rentalPackage',
    _id: uuidv4(),
    title: 'Premium Corporate Suite',
    slug: { _type: 'slug', current: 'premium-corporate-suite' },
    description: 'Comprehensive solution for established companies seeking impressive office environments.',
    price: '$899/month',
    duration: '6-month minimum',
    features: [
      '60+ plants of various sizes',
      'Living wall installation',
      'Custom planter design',
      'Weekly maintenance',
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
    title: 'Executive Collection',
    slug: { _type: 'slug', current: 'executive-collection' },
    description: 'High-end specimen plants for executive offices and boardrooms.',
    price: '$299/month',
    duration: 'Monthly subscription',
    features: [
      '8 premium specimen plants',
      'Designer planters',
      'Weekly maintenance',
      'Plant health monitoring',
      'Custom plant selection',
      'Executive consultation'
    ],
    packageType: 'executive',
    isPopular: false,
    isActive: true,
  },
  {
    _type: 'rentalPackage',
    _id: uuidv4(),
    title: 'Event & Conference Package',
    slug: { _type: 'slug', current: 'event-conference-package' },
    description: 'Short-term plant rental for events, conferences, and special occasions.',
    price: '$799/event',
    duration: '1-3 days',
    features: [
      'Up to 50 plants',
      'Custom event design',
      'Delivery and setup',
      'Event day support',
      'Same-day pickup',
      'Design consultation'
    ],
    packageType: 'event',
    isPopular: false,
    isActive: true,
  },
  {
    _type: 'rentalPackage',
    _id: uuidv4(),
    title: 'Retail Display Enhancement',
    slug: { _type: 'slug', current: 'retail-display-enhancement' },
    description: 'Strategic plant arrangements for retail spaces to enhance customer experience.',
    price: '$249/month',
    duration: '3-month minimum',
    features: [
      '15 display plants',
      'Seasonal rotation',
      'Bi-weekly maintenance',
      'Brand-aligned design',
      'Window display plants',
      'Store layout consultation'
    ],
    packageType: 'retail',
    isPopular: false,
    isActive: true,
  },
  {
    _type: 'rentalPackage',
    _id: uuidv4(),
    title: 'Healthcare Wellness Package',
    slug: { _type: 'slug', current: 'healthcare-wellness-package' },
    description: 'Therapeutic plant selection for healthcare facilities and wellness centers.',
    price: '$449/month',
    duration: '6-month minimum',
    features: [
      '20 air-purifying plants',
      'Non-toxic plant selection',
      'Weekly maintenance',
      'Sensory garden elements',
      'Patient room plants',
      'Medical-grade service'
    ],
    packageType: 'healthcare',
    isPopular: false,
    isActive: true,
  },
  {
    _type: 'rentalPackage',
    _id: uuidv4(),
    title: 'Restaurant Hospitality',
    slug: { _type: 'slug', current: 'restaurant-hospitality' },
    description: 'Atmospheric plant design for restaurants and hospitality venues.',
    price: '$349/month',
    duration: '3-month minimum',
    features: [
      '25 atmospheric plants',
      'Edible herb options',
      'Bi-weekly maintenance',
      'Theme-based design',
      'Bar and dining plants',
      'Patio plants included'
    ],
    packageType: 'hospitality',
    isPopular: false,
    isActive: true,
  },
  {
    _type: 'rentalPackage',
    _id: uuidv4(),
    title: 'Custom Design Solution',
    slug: { _type: 'slug', current: 'custom-design-solution' },
    description: 'Fully customized plant rental package tailored to your specific needs.',
    price: 'Custom Quote',
    duration: 'Flexible',
    features: [
      'Custom plant selection',
      'Bespoke planter design',
      'Flexible maintenance schedule',
      'Brand integration',
      'Specialized plant care',
      'Consultation service'
    ],
    packageType: 'custom',
    isPopular: false,
    isActive: true,
  },
  {
    _type: 'rentalPackage',
    _id: uuidv4(),
    title: 'Holiday & Seasonal',
    slug: { _type: 'slug', current: 'holiday-seasonal' },
    description: 'Seasonal plant rentals for holidays and special occasions.',
    price: '$199/season',
    duration: 'Seasonal (1-3 months)',
    features: [
      'Seasonal plant selection',
      'Holiday-themed arrangements',
      'Delivery and removal',
      'Setup service',
      'Storage included',
      'Early booking discount'
    ],
    packageType: 'seasonal',
    isPopular: false,
    isActive: true,
  }
];

// Expanded Blog Posts (20 tips)
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
  },
  {
    _type: 'blog',
    _id: uuidv4(),
    title: 'Common Plant Problems and How to Fix Them',
    slug: { _type: 'slug', current: 'common-plant-problems-fix' },
    excerpt: 'Identify and solve the most common indoor plant problems with our troubleshooting guide.',
    content: `
      <h2>Yellow Leaves</h2>
      <p>Yellow leaves usually indicate overwatering or underwatering. Check soil moisture and adjust watering schedule.</p>

      <h2>Brown Tips</h2>
      <p>Brown tips often mean low humidity or fluoride in water. Use filtered water and mist regularly.</p>

      <h2>Leggy Growth</h2>
      <p>Leggy plants need more light or pruning. Move to brighter location and pinch back growth.</p>

      <h2>Pest Infestations</h2>
      <p>Common pests include spider mites, mealybugs, and scale. Treat with insecticidal soap or neem oil.</p>
    `,
    publishedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    isFeatured: false,
  },
  {
    _type: 'blog',
    _id: uuidv4(),
    title: 'Best Plants for Small Apartments and Condos',
    slug: { _type: 'slug', current: 'best-plants-small-apartments-condos' },
    excerpt: 'Space-saving plant recommendations perfect for small living spaces and compact apartments.',
    content: `
      <h2>Vertical Growing Solutions</h2>
      <p>When floor space is limited, think vertically with hanging plants and wall-mounted planters.</p>

      <h2>Compact Plant Recommendations</h2>
      <ul>
        <li>Air Plants (Tillandsia) - No soil needed</li>
        <li>Succulents - Small and low maintenance</li>
        <li>Spider Plants - Great for hanging</li>
        <li>Pothos - Versatile and trailing</li>
      </ul>

      <h2>Multi-functional Furniture</h2>
      <p>Consider plant stands that double as storage or side tables with built-in planters.</p>
    `,
    publishedAt: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString(),
    isFeatured: false,
  },
  {
    _type: 'blog',
    _id: uuidv4(),
    title: 'Pet-Safe Houseplants: A Complete Guide',
    slug: { _type: 'slug', current: 'pet-safe-houseplants-guide' },
    excerpt: 'Keep your furry friends safe with our comprehensive guide to non-toxic houseplants.',
    content: `
      <h2>Why Pet Safety Matters</h2>
      <p>Many common houseplants can be toxic to pets if ingested. Always research plant safety before bringing them home.</p>

      <h2>Pet-Safe Plant Options</h2>
      <ul>
        <li>Spider Plant - Completely safe for cats and dogs</li>
        <li>Boston Fern - Non-toxic and air-purifying</li>
        <li>Prayer Plant - Safe and decorative</li>
        <li>Areca Palm - Pet-safe and tropical</li>
      </ul>

      <h2>Plants to Avoid</h2>
      <p>Keep pets away from lilies, pothos, and philodendrons, which can be harmful if ingested.</p>
    `,
    publishedAt: new Date(Date.now() - 49 * 24 * 60 * 60 * 1000).toISOString(),
    isFeatured: false,
  },
  {
    _type: 'blog',
    _id: uuidv4(),
    title: 'Indoor Plant Propagation: Multiply Your Greenery',
    slug: { _type: 'slug', current: 'indoor-plant-propagation-guide' },
    excerpt: 'Learn how to propagate your favorite indoor plants to expand your collection for free.',
    content: `
      <h2>Easy Propagation Methods</h2>
      <p>Propagation is an economical way to grow your plant collection and share plants with friends.</p>

      <h3>Stem Cuttings</h3>
      <p>Pothos, philodendron, and spider plants root easily in water or soil.</p>

      <h3>Division</h3>
      <p>Split plants like snake plants and peace lilies when they become root-bound.</p>

      <h3>Leaf Cuttings</h3>
      <p>Succulents and African violets can be propagated from single leaves.</p>

      <h2>Propagation Tips</h2>
      <ul>
        <li>Use clean, sharp tools</li>
        <li>Take cuttings in spring or summer</li>
        <li>Provide proper humidity and warmth</li>
        <li>Be patient - roots take time to develop</li>
      </ul>
    `,
    publishedAt: new Date(Date.now() - 56 * 24 * 60 * 60 * 1000).toISOString(),
    isFeatured: false,
  },
  {
    _type: 'blog',
    _id: uuidv4(),
    title: 'The Ultimate Guide to Indoor Plant Fertilizing',
    slug: { _type: 'slug', current: 'ultimate-guide-indoor-plant-fertilizing' },
    excerpt: 'Master the art of feeding your houseplants with our complete fertilizing guide.',
    content: `
      <h2>Why Fertilize Indoor Plants?</h2>
      <p>Potting soil contains limited nutrients. Regular fertilizing keeps plants healthy and promotes growth.</p>

      <h2>When to Fertilize</h2>
      <p>Fertilize during the growing season (spring and summer) when plants are actively growing.</p>

      <h2>Fertilizer Types</h2>
      <ul>
        <li>Liquid fertilizers - Quick absorption</li>
        <li>Slow-release granules - Long-lasting feeding</li>
        <li>Organic options - Natural ingredients</li>
      </ul>

      <h2>Application Tips</h2>
      <p>Always dilute fertilizers to half strength to avoid burning roots.</p>
    `,
    publishedAt: new Date(Date.now() - 63 * 24 * 60 * 60 * 1000).toISOString(),
    isFeatured: false,
  },
  {
    _type: 'blog',
    _id: uuidv4(),
    title: 'Creating an Indoor Herb Garden',
    slug: { _type: 'slug', current: 'creating-indoor-herb-garden' },
    excerpt: 'Grow fresh herbs year-round with our guide to setting up an indoor herb garden.',
    content: `
      <h2>Best Herbs for Indoor Growing</h2>
      <ul>
        <li>Basil - Loves warmth and bright light</li>
        <li>Mint - Easy to grow but invasive</li>
        <li>Rosemary - Needs good drainage</li>
        <li>Thyme - Drought-tolerant</li>
        <li>Parsley - Moderate light needs</li>
      </ul>

      <h2>Container Requirements</h2>
      <p>Use pots with drainage holes and quality potting mix. Group herbs with similar water needs together.</p>

      <h2>Light and Care</h2>
      <p>Most herbs need 6+ hours of direct sunlight. Consider grow lights if natural light is limited.</p>
    `,
    publishedAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString(),
    isFeatured: false,
  },
  {
    _type: 'blog',
    _id: uuidv4(),
    title: 'Winter Plant Care: Keeping Plants Healthy Indoors',
    slug: { _type: 'slug', current: 'winter-plant-care-indoors' },
    excerpt: 'Essential tips for keeping your indoor plants thriving during the challenging winter months.',
    content: `
      <h2>Winter Challenges</h2>
      <p>Winter brings lower light, dry air from heating, and temperature fluctuations that stress plants.</p>

      <h2>Adjusting Watering</h2>
      <p>Plants need less water in winter due to reduced growth and light. Check soil before watering.</p>

      <h2>Humidity Solutions</h2>
      <ul>
        <li>Group plants together</li>
        <li>Use pebble trays with water</li>
        <li>Run a humidifier nearby</li>
        <li>Mist plants regularly</li>
      </ul>

      <h2>Light Management</h2>
      <p>Move plants closer to windows or supplement with grow lights during darker months.</p>
    `,
    publishedAt: new Date(Date.now() - 77 * 24 * 60 * 60 * 1000).toISOString(),
    isFeatured: false,
  },
  {
    _type: 'blog',
    _id: uuidv4(),
    title: 'DIY Plant Stands and Displays',
    slug: { _type: 'slug', current: 'diy-plant-stands-displays' },
    excerpt: 'Creative and affordable DIY solutions for displaying your plant collection.',
    content: `
      <h2>Repurposed Materials</h2>
      <p>Transform everyday items into unique plant displays:</p>
      <ul>
        <li>Ladders - Vertical plant display</li>
        <li>Crates - Stacked plant shelving</li>
        <li>Pallets - Wall-mounted planters</li>
        <li>Bookshelves - Multi-level plant display</li>
      </ul>

      <h2>Macrame Plant Hangers</h2>
      <p>Create your own macrame hangers for trailing plants like pothos and spider plants.</p>

      <h2>Terrarium Projects</h2>
      <p>Build enclosed ecosystems with succulents and moisture-loving plants.</p>
    `,
    publishedAt: new Date(Date.now() - 84 * 24 * 60 * 60 * 1000).toISOString(),
    isFeatured: false,
  },
  {
    _type: 'blog',
    _id: uuidv4(),
    title: 'Air-Purifying Plants: Natural Air Cleaners',
    slug: { _type: 'slug', current: 'air-purifying-plants-natural-air-cleaners' },
    excerpt: 'Discover which houseplants are best at cleaning indoor air naturally.',
    content: `
      <h2>NASA Clean Air Study</h2>
      <p>Research identified several houseplants effective at removing indoor air pollutants.</p>

      <h2>Top Air-Purifying Plants</h2>
      <ul>
        <li>Snake Plant - Removes formaldehyde</li>
        <li>Peace Lily - Eliminates ammonia</li>
        <li>Spider Plant - Fights carbon monoxide</li>
        <li>English Ivy - Reduces airborne mold</li>
        <li>Boston Fern - Acts as a natural air humidifier</li>
      </ul>

      <h2>Placement Strategy</h2>
      <p>Place air-purifying plants in bedrooms, offices, and areas with electronic equipment.</p>
    `,
    publishedAt: new Date(Date.now() - 91 * 24 * 60 * 60 * 1000).toISOString(),
    isFeatured: false,
  },
  {
    _type: 'blog',
    _id: uuidv4(),
    title: 'Repotting Houseplants: When and How',
    slug: { _type: 'slug', current: 'repotting-houseplants-when-how' },
    excerpt: 'Complete guide to repotting houseplants for optimal growth and health.',
    content: `
      <h2>Signs Your Plant Needs Repotting</h2>
      <ul>
        <li>Roots growing through drainage holes</li>
        <li>Plant is top-heavy</li>
        <li>Water runs straight through soil</li>
        <li>Slow growth despite proper care</li>
        <li>Visible root crowding</li>
      </ul>

      <h2>Best Time to Repot</h2>
      <p>Repot in spring or early summer when plants are actively growing.</p>

      <h2>Step-by-Step Process</h2>
      <ol>
        <li>Choose a pot 1-2 inches larger</li>
        <li>Gently remove plant from current pot</li>
        <li>Loosen compacted roots</li>
        <li>Place in new pot with fresh soil</li>
        <li>Water thoroughly</li>
      </ol>
    `,
    publishedAt: new Date(Date.now() - 98 * 24 * 60 * 60 * 1000).toISOString(),
    isFeatured: false,
  },
  {
    _type: 'blog',
    _id: uuidv4(),
    title: 'Succulent Care for Beginners',
    slug: { _type: 'slug', current: 'succulent-care-beginners' },
    excerpt: 'Everything you need to know to keep your succulents thriving and beautiful.',
    content: `
      <h2>Why Succulents Are Great for Beginners</h2>
      <p>Succulents are forgiving, require minimal water, and come in endless varieties.</p>

      <h2>Essential Care Tips</h2>
      <h3>Watering</h3>
      <p>Water deeply but infrequently. Allow soil to dry completely between waterings.</p>

      <h3>Light Requirements</h3>
      <p>Most succulents need 6+ hours of bright, indirect light daily.</p>

      <h3>Soil and Potting</h3>
      <p>Use well-draining cactus mix and pots with drainage holes.</p>

      <h2>Common Problems</h2>
      <p>Overwatering is the most common issue. When in doubt, don't water!</p>
    `,
    publishedAt: new Date(Date.now() - 105 * 24 * 60 * 60 * 1000).toISOString(),
    isFeatured: false,
  },
  {
    _type: 'blog',
    _id: uuidv4(),
    title: 'Indoor Plant Pest Control: Natural Solutions',
    slug: { _type: 'slug', current: 'indoor-plant-pest-control-natural-solutions' },
    excerpt: 'Natural and effective ways to control common indoor plant pests without harsh chemicals.',
    content: `
      <h2>Common Indoor Pests</h2>
      <ul>
        <li>Spider Mites - Tiny webbing on leaves</li>
        <li>Mealybugs - White cottony masses</li>
        <li>Aphids - Small clusters on new growth</li>
        <li>Scale - Brown bumps on stems</li>
      </ul>

      <h2>Natural Treatment Options</h2>
      <h3>Neem Oil</h3>
      <p>Mix 2 teaspoons neem oil with 1 gallon water. Spray plants thoroughly.</p>

      <h3>Insecticidal Soap</h3>
      <p>Commercial or homemade soap solutions effectively treat most pests.</p>

      <h3>Prevention</h3>
      <p>Quarantine new plants and inspect regularly for early detection.</p>
    `,
    publishedAt: new Date(Date.now() - 112 * 24 * 60 * 60 * 1000).toISOString(),
    isFeatured: false,
  },
  {
    _type: 'blog',
    _id: uuidv4(),
    title: 'Creating a Plant-Friendly Workspace',
    slug: { _type: 'slug', current: 'creating-plant-friendly-workspace' },
    excerpt: 'Transform your office into a green oasis with these workspace plant design tips.',
    content: `
      <h2>Benefits of Office Plants</h2>
      <ul>
        <li>Reduced stress and anxiety</li>
        <li>Increased productivity</li>
        <li>Improved air quality</li>
        <li>Enhanced creativity</li>
        <li>Better workplace atmosphere</li>
      </ul>

      <h2>Strategic Plant Placement</h2>
      <ul>
        <li>Desk plants for personal spaces</li>
        <li>Statement plants in common areas</li>
        <li>Hanging plants to maximize space</li>
        <li>Living walls for dramatic impact</li>
      </ul>

      <h2>Low-Maintenance Office Plants</h2>
      <p>Choose plants that tolerate office conditions and require minimal care.</p>
    `,
    publishedAt: new Date(Date.now() - 119 * 24 * 60 * 60 * 1000).toISOString(),
    isFeatured: false,
  },
  {
    _type: 'blog',
    _id: uuidv4(),
    title: 'Tropical Plants for Indoor Jungles',
    slug: { _type: 'slug', current: 'tropical-plants-indoor-jungles' },
    excerpt: 'Create your own indoor jungle with these stunning tropical plants.',
    content: `
      <h2>Popular Tropical Plants</h2>
      <ul>
        <li>Monstera Deliciosa - Swiss cheese plant</li>
        <li>Fiddle Leaf Fig - Statement tree</li>
        <li>Bird of Paradise - Exotic blooms</li>
        <li>Calathea - Patterned leaves</li>
        <li>Parlor Palm - Elegant and graceful</li>
      </ul>

      <h2>Tropical Plant Care</h2>
      <h3>Humidity</h3>
      <p>Tropical plants love humidity. Group plants together or use a humidifier.</p>

      <h3>Temperature</h3>
      <p>Maintain temperatures between 65-80°F for optimal growth.</p>

      <h3>Water</h3>
      <p>Keep soil consistently moist but not waterlogged.</p>
    `,
    publishedAt: new Date(Date.now() - 126 * 24 * 60 * 60 * 1000).toISOString(),
    isFeatured: false,
  },
  {
    _type: 'blog',
    _id: uuidv4(),
    title: 'Plant Shopping Guide: What to Look For',
    slug: { _type: 'slug', current: 'plant-shopping-guide-what-to-look-for' },
    excerpt: 'Expert tips for selecting healthy plants at the nursery or garden center.',
    content: `
      <h2>Inspecting Plant Health</h2>
      <ul>
        <li>Check for pests on undersides of leaves</li>
        <li>Look for yellow or brown spots</li>
        <li>Examine stems for damage</li>
        <li>Check soil moisture level</li>
        <li>Look for new growth</li>
      </ul>

      <h2>Root Ball Inspection</h2>
      <p>Gently remove plant from pot to check root health. Avoid plants with circling roots.</p>

      <h2>Size Considerations</h2>
      <p>Choose plants that will fit your space but allow room for growth.</p>

      <h2>Questions to Ask</h2>
      <p>Inquire about care requirements, light needs, and plant history.</p>
    `,
    publishedAt: new Date(Date.now() - 133 * 24 * 60 * 60 * 1000).toISOString(),
    isFeatured: false,
  },
  {
    _type: 'blog',
    _id: uuidv4(),
    title: 'Plant Trends 2024: What\'s Hot in Indoor Gardening',
    slug: { _type: 'slug', current: 'plant-trends-2024-hot-indoor-gardening' },
    excerpt: 'Discover the latest trends in indoor gardening and plant care for 2024.',
    content: `
      <h2>Emerging Plant Trends</h2>
      <h3>Rare and Unusual Varieties</h3>
      <p>Plant collectors are seeking unique and hard-to-find species.</p>

      <h3>Variegated Plants</h3>
      <p>Plants with patterned leaves are highly sought after for their visual interest.</p>

      <h3>Sustainable Gardening</h3>
      <p>Eco-friendly practices like composting and water conservation are trending.</p>

      <h2>Popular Plant Styles</h2>
      <ul>
        <li>Minimalist arrangements</li>
        <li>Jungle-inspired interiors</li>
        <li>Desert-themed spaces</li>
        <li>Retro houseplants revival</li>
      </ul>
    `,
    publishedAt: new Date(Date.now() - 140 * 24 * 60 * 60 * 1000).toISOString(),
    isFeatured: false,
  }
];

// Supporting data (unchanged but expanded)
const blogCategories = [
  { _type: 'blogCategory', _id: uuidv4(), title: 'Care Tips', description: 'Plant care guides and maintenance tips' },
  { _type: 'blogCategory', _id: uuidv4(), title: 'Office Plants', description: 'Plants suitable for office environments' },
  { _type: 'blogCategory', _id: uuidv4(), title: 'Research', description: 'Scientific studies on plant benefits' },
  { _type: 'blogCategory', _id: uuidv4(), title: 'Workplace', description: 'Office design and workplace wellness' },
  { _type: 'blogCategory', _id: uuidv4(), title: 'Beginner', description: 'Guides for plant care beginners' },
  { _type: 'blogCategory', _id: uuidv4(), title: 'Advanced', description: 'Expert plant care techniques' },
  { _type: 'blogCategory', _id: uuidv4(), title: 'DIY Projects', description: 'Creative plant projects and crafts' },
  { _type: 'blogCategory', _id: uuidv4(), title: 'Propagation', description: 'Plant propagation and growing techniques' }
];

const authors = [
  { _type: 'author', _id: uuidv4(), name: 'Jane Doe', bio: 'Plant care specialist with over 10 years of experience in interior landscaping and corporate plant design.' },
  { _type: 'author', _id: uuidv4(), name: 'John Smith', bio: 'Horticultural researcher and writer focusing on the intersection of plants and workplace productivity.' },
  { _type: 'author', _id: uuidv4(), name: 'Emily Chen', bio: 'Urban gardener and sustainability advocate specializing in small-space gardening and apartment living.' },
  { _type: 'author', _id: uuidv4(), name: 'Michael Rodriguez', bio: 'Landscape designer with expertise in biophilic design and therapeutic gardens.' }
];

// Complete massive seeding function
async function seedMassiveData() {
  try {
    console.log('🚀 Starting MASSIVE sample data seeding...');
    console.log('📊 Target: 50 gallery items, 20 interior solutions, 20 tips');

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

    console.log('\n🎉 MASSIVE sample data seeding completed!');
    console.log('\n📋 Summary:');
    console.log(`✅ Successfully created: ${successCount} items`);
    console.log(`❌ Errors encountered: ${errorCount} items`);
    console.log('\n📊 Content breakdown:');
    console.log(`- Gallery: ${galleryItems.length} items ✅`);
    console.log(`- Interior Solutions: ${landscapingProjects.length + rentalPackages.length} items ✅`);
    console.log(`  - Landscaping Projects: ${landscapingProjects.length} items`);
    console.log(`  - Rental Packages: ${rentalPackages.length} items`);
    console.log(`- Tips/Blog Posts: ${blogPosts.length} items ✅`);
    console.log(`- Authors: ${authors.length} items`);
    console.log(`- Blog Categories: ${blogCategories.length} items`);
    console.log(`- Total: ${galleryItems.length + landscapingProjects.length + rentalPackages.length + blogPosts.length + authors.length + blogCategories.length} items`);

    console.log('\n📝 Next steps:');
    console.log('1. Go to Sanity Studio to review and publish the documents');
    console.log('2. Upload images and replace placeholder references');
    console.log('3. Check your website pages for the new content');
    console.log('\n🚀 Your Gallery, Interior Solutions, and Tips sections are now MASSIVELY populated!');

  } catch (error) {
    console.error('❌ Error seeding sample data:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedMassiveData();