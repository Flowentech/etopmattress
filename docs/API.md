# API Documentation

## Overview

The InterioWale API provides RESTful endpoints for managing users, stores, products, orders, and architecture services. All endpoints are protected by authentication and role-based authorization.

## Base URL
```
https://interiowale.com/api
```

## Authentication

All API endpoints require authentication using Clerk. Include the user's session token in the request headers.

### Authentication Header
```
Authorization: Bearer <clerk_session_token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": <response_data>,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [<items>],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "hasMore": true
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| UNAUTHORIZED | User not authenticated |
| FORBIDDEN | User lacks permission |
| NOT_FOUND | Resource not found |
| VALIDATION_ERROR | Invalid request data |
| RATE_LIMIT_EXCEEDED | Too many requests |
| INTERNAL_ERROR | Server error |
| CACHE_ERROR | Cache service error |
| DATABASE_ERROR | Database operation failed |

---

## User Management API

### User Onboarding
**POST** `/users/onboard`

Creates a new user profile with default settings.

**Request Body:**
```json
{
  "preferences": {
    "enableShopping": true,
    "enableArchitectureServices": false,
    "defaultDashboard": "shopping"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "User profile created successfully",
    "profile": {
      "id": "user_id",
      "clerkId": "clerk_user_id",
      "role": "customer",
      "isActive": true,
      "preferences": {
        "enableShopping": true,
        "enableArchitectureServices": false,
        "defaultDashboard": "shopping"
      }
    }
  }
}
```

### Get User Profile
**GET** `/users/profile`

Retrieves the current user's profile information.

**Query Parameters:**
- `userId` (string): User ID (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "user_id",
      "clerkId": "clerk_user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "customer",
      "isActive": true,
      "isVerified": true,
      "preferences": {
        "enableShopping": true,
        "enableArchitectureServices": false,
        "defaultDashboard": "shopping",
        "emailNotifications": true,
        "smsNotifications": false,
        "marketingEmails": false
      }
    }
  }
}
```

### Update User Profile
**PUT** `/users/profile`

Updates user profile information.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Profile updated successfully",
    "profile": <updated_profile_object>
  }
}
```

### Update User Role
**PUT** `/users/role`

Upgrades user role (e.g., from customer to customer-architect-client).

**Request Body:**
```json
{
  "role": "customer_architect_client",
  "reason": "Want to use both shopping and architecture services"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Role upgrade request submitted successfully",
    "newRole": "customer_architect_client"
  }
}
```

### Get User Settings
**GET** `/users/settings`

Retrieves user preferences and settings.

**Query Parameters:**
- `userId` (string): User ID (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "settings": {
      "preferences": {
        "enableShopping": true,
        "enableArchitectureServices": true,
        "defaultDashboard": "shopping",
        "emailNotifications": true,
        "smsNotifications": false,
        "marketingEmails": false
      },
      "profile": {
        "bio": "Interior design enthusiast",
        "avatar": "https://example.com/avatar.jpg"
      },
      "billing": {
        "paymentMethods": [
          {
            "id": "pm_123",
            "type": "card",
            "last4": "4242",
            "brand": "visa"
          }
        ]
      }
    }
  }
}
```

### Update User Settings
**PUT** `/users/settings`

Updates user preferences and settings.

**Request Body:**
```json
{
  "userId": "user_id",
  "settings": {
    "preferences": {
      "enableShopping": true,
      "enableArchitectureServices": true,
      "defaultDashboard": "architecture",
      "emailNotifications": true,
      "marketingEmails": true
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Settings updated successfully",
    "settings": <updated_settings_object>
  }
}
```

### Get User Orders
**GET** `/users/orders`

Retrieves user's order history.

**Query Parameters:**
- `userId` (string): User ID (auto from auth)
- `limit` (number): Number of orders per page (default: 10)
- `offset` (number): Number of orders to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "_id": "order_id",
        "orderNumber": "ORD-2024-001",
        "status": "delivered",
        "orderDate": "2024-01-15T10:30:00.000Z",
        "total": 299.99,
        "items": [
          {
            "product": {
              "_id": "product_id",
              "name": "Modern Sofa",
              "images": ["https://example.com/sofa.jpg"]
            },
            "quantity": 1,
            "price": 299.99
          }
        ],
        "shippingAddress": {
          "street": "123 Main St",
          "city": "New York",
          "state": "NY",
          "zipCode": "10001"
        }
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "hasMore": true
    }
  }
}
```

### Get User Stats
**GET** `/users/stats`

Retrieves user's shopping statistics.

**Query Parameters:**
- `userId` (string): User ID (auto from auth)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalOrders": 25,
    "totalSpent": 5429.99,
    "averageOrderValue": 217.20,
    "favoriteCategories": ["furniture", "decor", "lighting"],
    "recentActivity": {
      "lastOrderDate": "2024-01-15T10:30:00.000Z",
      "daysSinceLastOrder": 5
    }
  }
}
```

---

## Store Management API

### Get Public Stores
**GET** `/stores`

Retrieves a list of active and approved stores for public browsing.

**Query Parameters:**
- `category` (string): Filter by category (optional)
- `search` (string): Search term (optional)
- `limit` (number): Number of stores per page (default: 20)
- `offset` (number): Number of stores to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "stores": [
      {
        "_id": "store_id",
        "name": "Modern Furniture Co",
        "slug": "modern-furniture-co",
        "description": "Contemporary furniture for modern homes",
        "logo": "https://example.com/logo.jpg",
        "owner": {
          "name": "Store Owner",
          "email": "owner@store.com"
        },
        "settings": {
          "categories": ["furniture", "decor"],
          "branding": {
            "primaryColor": "#3B82F6",
            "secondaryColor": "#10B981"
          }
        },
        "stats": {
          "totalProducts": 150,
          "totalOrders": 1250,
          "monthlyRevenue": 25000,
          "rating": 4.8,
          "reviewCount": 324
        }
      }
    ],
    "pagination": {
      "total": 50,
      "offset": 0,
      "limit": 20,
      "hasMore": true
    }
  }
}
```

### Register New Store
**POST** `/stores`

Registers a new store application.

**Request Body:**
```json
{
  "storeName": "My Furniture Store",
  "storeSlug": "my-furniture-store",
  "description": "High-quality furniture for every home",
  "category": "furniture",
  "businessName": "Furniture Business Inc",
  "businessType": "llc",
  "contactPerson": "John Store Owner",
  "contactEmail": "owner@store.com",
  "contactPhone": "+1234567890",
  "businessAddress": {
    "address": "123 Business St",
    "city": "Business City",
    "state": "BC",
    "pincode": "12345",
    "country": "USA"
  },
  "websiteUrl": "https://mystore.com",
  "socialMedia": {
    "instagram": "@mystore",
    "facebook": "mystore",
    "linkedin": "my-company"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "storeId": "new_store_id",
    "message": "Store application submitted successfully. You will receive an email once it's approved."
  }
}
```

### Get Store Statistics
**GET** `/store/stats`

Retrieves statistics for a specific store.

**Query Parameters:**
- `storeId` (string): Store ID (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalProducts": 150,
    "totalOrders": 1250,
    "totalRevenue": 250000,
    "pendingOrders": 12,
    "monthlyRevenue": 25000,
    "averageOrderValue": 200,
    "topProducts": [
      {
        "productId": "product_id",
        "name": "Modern Sofa",
        "sales": 45,
        "revenue": 13500
      }
    ],
    "recentOrders": [
      {
        "orderId": "order_id",
        "customerName": "John Doe",
        "total": 299.99,
        "status": "pending"
      }
    ]
  }
}
```

---

## Architecture Services API

### Get Architecture Firms
**GET** `/architecture/firms`

Retrieves architecture firms owned by the user.

**Query Parameters:**
- `userId` (string): User ID (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "firms": [
      {
        "_id": "firm_id",
        "name": "Modern Architecture Studio",
        "slug": "modern-architecture-studio",
        "description": "Contemporary architectural design",
        "logo": "https://example.com/firm-logo.jpg",
        "banner": "https://example.com/banner.jpg",
        "owner": {
          "userId": "user_id",
          "name": "Architect Name",
          "email": "architect@firm.com"
        },
        "businessAddress": {
          "street": "456 Design Ave",
          "city": "Architecture City",
          "state": "AC",
          "country": "USA"
        },
        "architectureSettings": {
          "specializations": ["residential", "commercial"],
          "servicesOffered": ["design", "consultation", "project-management"],
          "projectRange": {
            "minBudget": 50000,
            "maxBudget": 1000000
          }
        },
        "stats": {
          "totalProjects": 45,
          "completedProjects": 38,
          "averageRating": 4.9,
          "totalProposals": 156
        }
      }
    ]
  }
}
```

### Get Client Projects
**GET** `/architecture/client/projects`

Retrieves projects posted by an architecture client.

**Query Parameters:**
- `clientId` (string): Client user ID (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "_id": "project_id",
        "projectTitle": "Modern Home Renovation",
        "description": "Complete renovation of 3-bedroom house",
        "budget": {
          "min": 100000,
          "max": 150000,
          "currency": "USD"
        },
        "timeline": {
          "startDate": "2024-03-01",
          "endDate": "2024-08-01"
        },
        "location": {
          "address": "123 Renovation St",
          "city": "Renovation City",
          "state": "RC"
        },
        "status": "in_progress",
        "createdAt": "2024-01-10T15:30:00.000Z",
        "proposalCount": 5,
        "hasAcceptedProposal": true
      }
    ]
  }
}
```

### Get Client Proposals
**GET** `/architecture/client/proposals`

Retrieves proposals received for client's projects.

**Query Parameters:**
- `clientId` (string): Client user ID (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "proposals": [
      {
        "_id": "proposal_id",
        "proposedPrice": 125000,
        "timelineEstimate": "5 months",
        "status": "accepted",
        "submittedAt": "2024-01-15T14:20:00.000Z",
        "project": {
          "_id": "project_id",
          "projectTitle": "Modern Home Renovation",
          "budget": {
            "min": 100000,
            "max": 150000
          },
          "location": "Renovation City"
        },
        "architect": {
          "_id": "architect_id",
          "name": "Modern Architecture Studio",
          "email": "architect@firm.com",
          "logo": "https://example.com/firm-logo.jpg"
        }
      }
    ]
  }
}
```

### Get Client Statistics
**GET** `/architecture/client/stats`

Retrieves architecture client statistics.

**Query Parameters:**
- `clientId` (string): Client user ID (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalProjects": 8,
    "activeProjects": 2,
    "completedProjects": 5,
    "totalSpent": 450000,
    "pendingProposals": 3,
    "averageProjectValue": 90000
  }
}
```

---

## Admin API

### Get System Overview
**GET** `/admin/overview`

Retrieves system-wide statistics (Admin only).

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 10000,
    "totalStores": 250,
    "totalArchitects": 180,
    "totalProjects": 1200,
    "totalOrders": 15000,
    "totalRevenue": 2500000,
    "recentRegistrations": 45,
    "pendingApplications": {
      "stores": 12,
      "architects": 8
    }
  }
}
```

### Get Performance Metrics
**GET** `/admin/performance`

Retrieves system performance metrics (Admin only).

**Response:**
```json
{
  "success": true,
  "data": {
    "apiMetrics": {
      "totalRequests": 50000,
      "averageResponseTime": 145,
      "errorRate": 0.02,
      "topEndpoints": [
        {
          "endpoint": "/api/stores",
          "requests": 15000,
          "avgResponseTime": 120
        }
      ]
    },
    "cacheMetrics": {
      "hitRate": 0.85,
      "totalKeys": 500,
      "memoryUsage": "45MB"
    },
    "databaseMetrics": {
      "queryTime": 45,
      "totalQueries": 10000
    }
  }
}
```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

| Endpoint | Rate Limit |
|----------|------------|
| Authentication endpoints | 5 requests/minute |
| Store registration | 3 requests/hour |
| Public endpoints | 100 requests/minute |
| Authenticated endpoints | 60 requests/minute |
| Admin endpoints | 30 requests/minute |

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640995200
```

## Caching

API responses are cached to improve performance:

- **Public stores**: 30 minutes
- **User profiles**: 10 minutes
- **Product data**: 15 minutes
- **Statistics**: 5 minutes

Cache headers indicate caching status:
```
Cache-Control: public, max-age=1800, s-maxage=1800
X-Cache: HIT
```

## Webhooks

The API supports webhooks for real-time notifications:

### Order Status Updates
```json
{
  "event": "order.status_updated",
  "data": {
    "orderId": "order_id",
    "status": "shipped",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Project Proposals
```json
{
  "event": "project.proposal_received",
  "data": {
    "projectId": "project_id",
    "proposalId": "proposal_id",
    "architectId": "architect_id",
    "timestamp": "2024-01-15T14:20:00.000Z"
  }
}
```

## SDK Examples

### JavaScript/TypeScript
```typescript
import { Clerk } from '@clerk/clerk-sdk-node';

const client = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

// Get user profile
async function getUserProfile(userId: string) {
  const response = await fetch(`/api/users/profile?userId=${userId}`, {
    headers: {
      'Authorization': `Bearer ${await client.getSessionToken()}`
    }
  });
  return response.json();
}

// Create store
async function createStore(storeData: any) {
  const response = await fetch('/api/stores', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${await client.getSessionToken()}`
    },
    body: JSON.stringify(storeData)
  });
  return response.json();
}
```

### cURL Examples
```bash
# Get user profile
curl -X GET "https://interiowale.com/api/users/profile?userId=user_123" \
  -H "Authorization: Bearer <clerk_token>"

# Register store
curl -X POST "https://interiowale.com/api/stores" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <clerk_token>" \
  -d '{
    "storeName": "My Store",
    "storeSlug": "my-store",
    "description": "A wonderful store",
    "category": "furniture",
    "contactPerson": "John Doe",
    "contactEmail": "john@example.com"
  }'
```

## Support

For API support and questions:
- **Documentation**: https://docs.interiowale.com
- **Support Email**: api-support@interiowale.com
- **Status Page**: https://status.interiowale.com
- **GitHub Issues**: https://github.com/interiowale/api/issues

## Changelog

### v1.0.0 (2024-01-15)
- Initial API release
- User management endpoints
- Store management system
- Architecture services API
- Admin dashboard endpoints

### v1.1.0 (Planned)
- Enhanced filtering and search
- Advanced analytics endpoints
- Real-time notifications API
- Mobile optimization