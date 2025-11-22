import { defineQuery } from "next-sanity";
// import { client.fetch } from "../lib/live";
import { CouponCode } from "./couponCodes";
import { backendClient } from "../lib/backendClient";
import { client } from "../lib/client";

export const getAllProducts = async () => {
  const PRODUCTS_QUERY = defineQuery(`*[_type=="product"] | order(name asc)`);
  try {
    const products = await client.fetch(PRODUCTS_QUERY);
    return products || [];
  } catch (error) {
    console.log("Error fetching all products:", error);
    return [];
  }
};

export const getAllCategories = async () => {
  const CATEGORIES_QUERY = defineQuery(
    `*[_type=="category"] | order(order asc, title asc) {
      _id,
      title,
      slug,
      description,
      image,
      level,
      order,
      "parent": parent-> {
        _id,
        title,
        slug
      }
    }`
  );

  try {
    const categories = await client.fetch(CATEGORIES_QUERY);
    return categories || [];
  } catch (error) {
    console.log("Error fetching all categories:", error);
    return [];
  }
};

// Optimized version with product count - use this for filters
export const getCategoriesOptimized = async () => {
  const CATEGORIES_OPTIMIZED_QUERY = defineQuery(`
    *[_type == "category"] {
      _id,
      title,
      slug,
      description,
      image,
      "productCount": count(*[_type == "product" && references(^._id)])
    } | order(title asc)
  `);

  try {
    const categories = await client.fetch(CATEGORIES_OPTIMIZED_QUERY);
    return categories || [];
  } catch (error) {
    console.log("Error fetching optimized categories:", error);
    return [];
  }
};

export const getAllSectionCategories = async () => {
  const CATEGORIES_QUERY = defineQuery(
    `*[_type=="navigationcategory"] | order(name asc)`
  );

  try {
    const categories = await client.fetch(CATEGORIES_QUERY);
    return categories || [];
  } catch (error) {
    console.log("Error fetching all navigationcategory:", error);
    return [];
  }
};
export const getActiveSaleByCouponCode = async (couponCode: CouponCode) => {
  const ACTIVE_COUPON_CODE = defineQuery(
    `*[_type == 'sale' && isActive == true && couponCode == $couponCode] | order(validFrom desc)[0]`
  );

  try {
    const activeSale = await client.fetch(ACTIVE_COUPON_CODE, {
      couponCode,
    });
    return activeSale || null;
  } catch (error) {
    console.error("Error fetching active sale by coupon code:", error);
    return null;
  }
};

export const searchProductsByName = async (searchParam: string) => {
  const PRODUCT_SEARCH_QUERY = defineQuery(
    `*[_type == "product" && name match $searchParam] | order(name asc)`
  );

  try {
    const products = await client.fetch(PRODUCT_SEARCH_QUERY, {
      searchParam: `${searchParam}`,
    });
    return products || [];
  } catch (error) {
    console.error("Error fetching products by name:", error);
    return [];
  }
};

export const getProductBySlug = async (slug: string) => {
  const PRODUCT_BY_ID_QUERY = defineQuery(
    `*[_type == "product" && slug.current == $slug] | order(name asc) [0]`
  );

  try {
    const product = await client.fetch(PRODUCT_BY_ID_QUERY, {
      slug,
    });
    return product || null;
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    return null;
  }
};

export const getProductsByCategory = async (categorySlug: string) => {
  const PRODUCT_BY_CATEGORY_QUERY = defineQuery(
    `*[_type == 'product' && references(*[_type == "category" && slug.current == $categorySlug]._id)] | order(name asc)`
  );
  try {
    const products = await client.fetch(PRODUCT_BY_CATEGORY_QUERY, {
      categorySlug,
    });
    return products || [];
  } catch (error) {
    console.error("Erroor fetching products by category:", error);
    return [];
  }
};

export const getSale = async () => {
  const SALE_QUERY = defineQuery(`*[_type == 'sale'] | order(name asc)`);
  try {
    const sales = await client.fetch(SALE_QUERY);
    return sales || [];
  } catch (error) {
    console.error("Error fetching sales:", error);
    return [];
  }
};

export const getMyOrders = async (userId: string) => {
  if (!userId) {
    throw new Error("User ID is required");
  }
  const MY_ORDERS_QUERY =
    defineQuery(`*[_type == 'order' && clerkUserId == $userId] | order(orderDate desc){
      ...,products[]{
        ...,product->
      }
    }`);

  try {
    const orders = await client.fetch(MY_ORDERS_QUERY, { userId });
    return orders || [];
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};

// products by navigation category
export const getProductsByNavigationCategory = async (categorySlug: string) => {
  const PRODUCT_BY_NAV_CATEGORY_QUERY = defineQuery(
    `*[_type == 'product' && references(*[_type == "navigationcategory" && slug.current == $categorySlug]._id)] | order(name asc)`
  );
  
  try {
    const products = await client.fetch(PRODUCT_BY_NAV_CATEGORY_QUERY, {
      categorySlug,
    });
    return products || [];
  } catch (error) {
    console.error("Error fetching products by navigation category:", error);
    return [];
  }
};

export const getTrendingProducts = async () => {
  return await getProductsByNavigationCategory('trending');
};

export const getBestSellerProducts = async () => {
  return await getProductsByNavigationCategory('bestseller');
};

export const getFeaturedProducts = async () => {
  return await getProductsByNavigationCategory('featured');
};

export const getNewArrivals = async () => {
  return await getProductsByNavigationCategory('new-arrivals');
};

export const getAllContactMessages = async () => {
  const CONTACT_QUERY = defineQuery(
    `*[_type == 'contact'] | order(submittedAt desc)`
  );

  try {
    const contacts = await client.fetch(CONTACT_QUERY);
    return contacts || [];
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    return [];
  }
};

export const markContactAsRead = async (contactId: string) => {
  const MARK_READ_QUERY = defineQuery(
    `*[_type == 'contact' && _id == $contactId][0]`
  );

  try {
    const contact = await client.fetch(MARK_READ_QUERY, { contactId });
    
    if (contact) {
      await backendClient.patch(contactId).set({ isRead: true }).commit();
      return { success: true };
    }
    return { success: false, error: "Contact not found" };
  } catch (error) {
    console.error("Error marking contact as read:", error);
    return { success: false, error: "Failed to update contact" };
  }
};

export const getAllBlogs = async () => {
  const BLOGS_QUERY = defineQuery(`
    *[_type == "blog"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      excerpt,
      coverImage,
      publishedAt,
      author->{
        name
      },
      categories[]->{
        title
      },
      isFeatured
    }
  `);

  try {
    const blogs = await client.fetch(BLOGS_QUERY);
    return blogs || [];
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }
};

export const getBlogsByCategory = async (category: string) => {
  const BLOGS_BY_CATEGORY_QUERY = defineQuery(`
    *[_type == "blog" && $category in categories[]->title] | order(publishedAt desc) {
      _id,
      title,
      slug,
      excerpt,
      coverImage,
      publishedAt,
      author->{
        name
      },
      categories[]->{
        title
      },
      isFeatured
    }
  `);

  try {
    const blogs = await client.fetch(BLOGS_BY_CATEGORY_QUERY, { category });
    return blogs || [];
  } catch (error) {
    console.error("Error fetching blogs by category:", error);
    return [];
  }
};

export const getBlogBySlug = async (slug: string) => {
  const BLOG_BY_SLUG_QUERY = defineQuery(`
    *[_type == "blog" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      excerpt,
      content,
      coverImage,
      publishedAt,
      author->{
        name,
        image
      },
      categories[]->{
        title
      },
      isFeatured
    }
  `);

  try {
    const blog = await client.fetch(BLOG_BY_SLUG_QUERY, { slug });
    return blog || null;
  } catch (error) {
    console.error("Error fetching blog by slug:", error);
    return null;
  }
};

export const getAllLandscapingProjects = async () => {
  const LANDSCAPING_QUERY = defineQuery(`
    *[_type == "landscapingProject" && isActive == true] | order(title asc) {
      _id,
      title,
      slug,
      description,
      image,
      features,
      price,
      category
    }
  `);

  try {
    const projects = await client.fetch(LANDSCAPING_QUERY);
    return projects || [];
  } catch (error) {
    console.error("Error fetching landscaping projects:", error);
    return [];
  }
};

export const getLandscapingProjectBySlug = async (slug: string) => {
  const PROJECT_BY_SLUG_QUERY = defineQuery(`
    *[_type == "landscapingProject" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      description,
      detailedDescription,
      image,
      gallery,
      features,
      price,
      category
    }
  `);

  try {
    const project = await client.fetch(PROJECT_BY_SLUG_QUERY, { slug });
    return project || null;
  } catch (error) {
    console.error("Error fetching project by slug:", error);
    return null;
  }
};

export const getAllRentalPackages = async () => {
  const RENTAL_PACKAGES_QUERY = defineQuery(`
    *[_type == "rentalPackage" && isActive == true] | order(packageType asc) {
      _id,
      title,
      slug,
      description,
      price,
      duration,
      features,
      image,
      packageType,
      isPopular
    }
  `);

  try {
    const packages = await client.fetch(RENTAL_PACKAGES_QUERY);
    return packages || [];
  } catch (error) {
    console.error("Error fetching rental packages:", error);
    return [];
  }
};

export const getRentalPackageBySlug = async (slug: string) => {
  const PACKAGE_BY_SLUG_QUERY = defineQuery(`
    *[_type == "rentalPackage" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      description,
      detailedDescription,
      price,
      duration,
      features,
      image,
      packageType,
      isPopular
    }
  `);

  try {
    const RentPackage = await client.fetch(PACKAGE_BY_SLUG_QUERY, { slug });
    return RentPackage || null;
  } catch (error) {
    console.error("Error fetching package by slug:", error);
    return null;
  }
};

// Gallery queries
export const GALLERY_QUERY = defineQuery(`
  *[_type=="gallery"] | order(_createdAt desc) {
    _id,
    title,
    slug,
    category,
    image {
      asset-> {
        _id,
        url
      }
    },
    description,
    features,
    isFeatured
  }
`);

export const GALLERY_BY_SLUG_QUERY = defineQuery(`*[_type == "gallery" && slug.current == $slug][0]`);

export const getAllGalleryItems = async () => {
  try {
    const data = await client.fetch(GALLERY_QUERY);
    return data || [];
  } catch (error) {
    console.error("Error fetching gallery items:", error);
    return [];
  }
};

export const getGalleryBySlug = async (slug: string) => {
  const data = await client.fetch(GALLERY_BY_SLUG_QUERY, { slug });
  return data;
};
