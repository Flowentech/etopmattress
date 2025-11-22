import { defineQuery } from "next-sanity";

// Optimized query for categories with product counts
export const CATEGORIES_WITH_COUNT_QUERY = defineQuery(`
  *[_type == "category"] {
    _id,
    title,
    slug,
    description,
    image,
    level,
    order,
    "parent": parent-> {
      _id,
      title
    },
    "productCount": count(*[_type == "product" && references(^._id)])
  } | order(order asc, title asc)
`);

// Optimized query for price ranges with actual product data
export const PRICE_RANGES_QUERY = defineQuery(`
  {
    "priceStats": {
      "min": min(*[_type == "product" && defined(price)].price),
      "max": max(*[_type == "product" && defined(price)].price),
      "average": avg(*[_type == "product" && defined(price)].price)
    },
    "priceRanges": [
      {
        "label": "Under $25",
        "min": 0,
        "max": 25,
        "count": count(*[_type == "product" && price < 25])
      },
      {
        "label": "$25 - $50", 
        "min": 25,
        "max": 50,
        "count": count(*[_type == "product" && price >= 25 && price <= 50])
      },
      {
        "label": "$50 - $100",
        "min": 50, 
        "max": 100,
        "count": count(*[_type == "product" && price > 50 && price <= 100])
      },
      {
        "label": "$100 - $200",
        "min": 100,
        "max": 200, 
        "count": count(*[_type == "product" && price > 100 && price <= 200])
      },
      {
        "label": "Over $200",
        "min": 200,
        "max": null,
        "count": count(*[_type == "product" && price > 200])
      }
    ]
  }
`);

// Optimized query for filter statistics
export const FILTER_STATS_QUERY = defineQuery(`
  {
    "availability": {
      "inStock": count(*[_type == "product" && stock > 0]),
      "outOfStock": count(*[_type == "product" && stock <= 0]),
      "onSale": count(*[_type == "product" && defined(discount) && discount > 0]),
      "newArrivals": count(*[_type == "product" && _createdAt > dateTime(now()) - 60*60*24*30])
    },
    "ratings": {
      "fourStarPlus": count(*[_type == "product" && rating >= 4]),
      "threeStarPlus": count(*[_type == "product" && rating >= 3]),
      "avgRating": avg(*[_type == "product" && defined(rating)].rating)
    },
    "totalProducts": count(*[_type == "product"])
  }
`);

// Fast category lookup query
export const CATEGORY_LOOKUP_QUERY = defineQuery(`
  *[_type == "category" && _id == $categoryId][0] {
    _id,
    title,
    slug,
    description
  }
`);

// Products by category with optimized fields
export const PRODUCTS_BY_CATEGORY_OPTIMIZED_QUERY = defineQuery(`
  *[_type == "product" && references($categoryId)] {
    _id,
    name,
    slug,
    price,
    discount,
    stock,
    status,
    image,
    label,
    rating,
    _createdAt
  } | order(name asc)
`);