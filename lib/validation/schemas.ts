import { z } from 'zod';

// Common validation patterns
const urlSchema = z.string().url('Invalid URL format');
const emailSchema = z.string().email('Invalid email format');
const uuidSchema = z.string().uuid('Invalid UUID format');
const nonEmptyString = z.string().min(1, 'Field cannot be empty');

// User validation schemas
export const userRoleSchema = z.enum(['customer', 'seller', 'architect', 'architect_client', 'admin', 'super_admin']);
export const userStatusSchema = z.enum(['active', 'inactive', 'suspended']);

// User profile validation
export const userProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: emailSchema,
  role: userRoleSchema.optional(),
  isActive: z.boolean().optional(),
});

// User update validation
export const userUpdateSchema = z.object({
  userId: nonEmptyString,
  role: userRoleSchema.optional(),
  status: userStatusSchema.optional(),
});

// Product validation schemas
export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100, 'Product name too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description too long'),
  price: z.number().positive('Price must be positive'),
  discount: z.number().min(0).max(100).optional(),
  stock: z.number().int().min(0, 'Stock must be non-negative'),
  categories: z.array(z.string()).min(1, 'At least one category required'),
  image: urlSchema.optional(),
});

// AI Design Generation validation
export const aiDesignRequestSchema = z.object({
  userId: uuidSchema,
  imageUrl: urlSchema,
  style: z.string().min(1, 'Style is required'),
  roomType: z.string().min(1, 'Room type is required'),
  dimensions: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
    length: z.number().positive().optional(),
  }).optional(),
  colorPreference: z.object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
  }).optional(),
  budget: z.object({
    min: z.number().positive(),
    max: z.number().positive(),
    label: z.string().optional(),
  }).optional(),
  preferences: z.object({
    furnitureStyle: z.string().optional(),
    lightingPreference: z.string().optional(),
    priority: z.string().optional(),
  }).optional(),
  prompt: z.string().max(1000, 'Prompt too long').optional(),
});

// Store validation schemas
export const storeSchema = z.object({
  name: z.string().min(1, 'Store name is required').max(100, 'Store name too long'),
  slug: z.string().min(1, 'Store slug is required').max(100, 'Store slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description too long'),
  email: emailSchema,
  phone: z.string().optional(),
  address: z.string().optional(),
  settings: z.object({
    enableCommission: z.boolean().default(true),
    commissionRate: z.number().min(0).max(100).default(10),
  }).optional(),
});

// Order validation schemas
export const orderSchema = z.object({
  items: z.array(z.object({
    productId: nonEmptyString,
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
    price: z.number().positive('Price must be positive'),
  })).min(1, 'Order must contain at least one item'),
  customerInfo: z.object({
    email: emailSchema,
    firstName: z.string().min(1, 'First name required'),
    lastName: z.string().min(1, 'Last name required'),
    phone: z.string().optional(),
    address: z.string().min(1, 'Address required'),
  }),
  totalAmount: z.number().positive('Total amount must be positive'),
});

// Pagination validation
export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  search: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
});

// AI Credit purchase validation
export const creditPurchaseSchema = z.object({
  packageId: nonEmptyString,
  credits: z.number().int().min(1, 'Credits must be at least 1'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3, 'Invalid currency format').default('USD'),
});

// Review validation
export const reviewSchema = z.object({
  productId: nonEmptyString,
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  title: z.string().min(1, 'Review title required').max(100, 'Title too long'),
  content: z.string().min(10, 'Review content must be at least 10 characters').max(2000, 'Content too long'),
});

// Wishlist validation
export const wishlistSchema = z.object({
  productId: nonEmptyString,
});

// Blog validation schemas
export const blogSchema = z.object({
  title: z.string().min(1, 'Blog title is required').max(100, 'Title too long'),
  slug: z.string().min(1, 'Slug is required').max(96, 'Slug too long'),
  excerpt: z.string().min(1, 'Excerpt is required').max(200, 'Excerpt too long'),
  content: z.array(z.any()).optional(),
  coverImage: z.string().url('Invalid cover image URL').optional(),
  publishedAt: z.string().optional(),
  author: z.string().optional(),
  categories: z.array(z.string()).optional(),
  isFeatured: z.boolean().default(false),
  seo: z.object({
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    metaKeywords: z.array(z.string()).optional(),
  }).optional(),
});

// Landscaping Project validation schemas
export const landscapingProjectSchema = z.object({
  title: z.string().min(1, 'Project title is required').max(100, 'Title too long'),
  slug: z.string().min(1, 'Slug is required').max(96, 'Slug too long'),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  detailedDescription: z.array(z.any()).optional(),
  image: z.string().url('Invalid project image URL').optional(),
  gallery: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  price: z.string().optional(),
  category: z.enum(['office-interior', 'rooftop-garden', 'restaurant-interior', 'resort-landscaping', 'factory-green', 'balcony-garden', 'home-green-decor']),
  isActive: z.boolean().default(true),
});

// Rental Package validation schemas
export const rentalPackageSchema = z.object({
  title: z.string().min(1, 'Package title is required').max(100, 'Title too long'),
  slug: z.string().min(1, 'Slug is required').max(96, 'Slug too long'),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  detailedDescription: z.array(z.any()).optional(),
  price: z.string().min(1, 'Price is required'),
  duration: z.string().optional(),
  features: z.array(z.string()).min(1, 'At least one feature is required'),
  image: z.string().url('Invalid package image URL').optional(),
  packageType: z.enum(['basic', 'standard', 'premium', 'custom']),
  isPopular: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

// Gallery validation schemas
export const gallerySchema = z.object({
  title: z.string().min(1, 'Gallery title is required').max(100, 'Title too long'),
  slug: z.string().min(1, 'Slug is required').max(96, 'Slug too long'),
  category: z.enum(['Living Room', 'Office', 'Bedroom', 'Kitchen', 'Outdoor']),
  image: z.string().url('Invalid main image URL').optional(),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  detailedDescription: z.array(z.any()).optional(),
  gallery: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  isFeatured: z.boolean().default(false),
});

// API Response validation helper
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error?.errors?.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    })) || [];

    // Only throw if there are actual validation errors
    if (errors.length > 0) {
      throw new ValidationError('Invalid request data', errors);
    }

    // If no errors but validation failed, return parsed data or fallback
    return data as T;
  }

  return result.data;
}

// Custom validation error class
export class ValidationError extends Error {
  constructor(message: string, public errors: Array<{field: string; message: string}>) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Export commonly used schemas
export const schemas = {
  userProfile: userProfileSchema,
  userUpdate: userUpdateSchema,
  product: productSchema,
  aiDesignRequest: aiDesignRequestSchema,
  store: storeSchema,
  order: orderSchema,
  pagination: paginationSchema,
  creditPurchase: creditPurchaseSchema,
  review: reviewSchema,
  wishlist: wishlistSchema,
  blog: blogSchema,
  landscapingProject: landscapingProjectSchema,
  rentalPackage: rentalPackageSchema,
  gallery: gallerySchema,
};