# System Architecture Documentation

## Overview

InterioWale is a multi-tenant marketplace platform that combines e-commerce functionality with architecture services. The system supports multiple user roles including customers, sellers, architects, and administrators, with a unified dashboard experience that allows users to seamlessly switch between shopping and architecture client functionality.

## Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library with shadcn/ui
- **State Management**: React hooks and server components
- **Charts**: Recharts for analytics dashboards
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes (Server Components)
- **Database**: Sanity CMS (Headless CMS)
- **Authentication**: Clerk
- **File Storage**: Sanity Asset Management
- **Email Service**: Resend API

### Infrastructure & DevOps
- **Deployment**: Vercel (Recommended)
- **CDN**: Sanity CDN for assets
- **Caching**: Redis with memory fallback
- **Monitoring**: Custom performance monitoring
- **Load Balancing**: Built-in Next.js optimization

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  Next.js App Router (React Server Components)                   │
│  ├── /dashboard (Unified Dashboard Router)                      │
│  ├── /dashboard/user (Customer/Architect Client)               │
│  ├── /dashboard/seller (Seller Dashboard)                       │
│  ├── /dashboard/architect (Architect Dashboard)                │
│  ├── /dashboard/admin (Admin Dashboard)                         │
│  └── / (Public Store & Architecture Pages)                     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  Next.js API Routes (/api/*)                                    │
│  ├── Authentication: Clerk Auth Middleware                      │
│  ├── Authorization: Role-based Access Control                   │
│  ├── Response Caching: Redis + Memory Cache                     │
│  └── Performance Monitoring                                     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                         │
├─────────────────────────────────────────────────────────────────┤
│  ├── User Management (Profile, Roles, Preferences)              │
│  ├── Store Management (Products, Orders, Inventory)             │
│  ├── Architecture Services (Projects, Proposals)                │
│  ├── Notification System (Email, Templates)                     │
│  ├── Payment Processing (Stripe Integration Ready)              │
│  └── Analytics & Reporting                                      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────────────────────┐ │
│  │    Sanity CMS       │  │         Redis Cache                 │ │
│  │                     │  │                                     │ │
│  │ • Users             │  │ • Session Data                      │ │
│  │ • Stores            │  │ • API Response Cache                │ │
│  │ • Products          │  │ • User Preferences                  │ │
│  │ • Orders            │  │ • Performance Metrics               │ │
│  │ • Architecture Data │  │                                     │ │
│  │ • Settings          │  │                                     │ │
│  └─────────────────────┘  └─────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## User Roles & Permissions

### Role Hierarchy
1. **Super Admin** - Full system access
2. **Admin** - Platform management
3. **Seller** - Store management
4. **Architect** - Architecture firm management
5. **Customer** - Shopping only
6. **Architect Client** - Architecture services only
7. **Customer Architect Client** - Dual functionality (shopping + architecture)

### Unified Dashboard System

#### Main Dashboard Router (`/dashboard/page.tsx`)
```typescript
// Role-based routing logic
switch (userRole) {
  case UserRole.CUSTOMER:
    redirect('/dashboard/user');
  case UserRole.SELLER:
    redirect('/dashboard/seller');
  case UserRole.ARCHITECT:
    redirect('/dashboard/architect');
  case UserRole.ARCHITECT_CLIENT:
    redirect('/dashboard/architect-client');
  case UserRole.CUSTOMER_ARCHITECT_CLIENT:
    redirect('/dashboard/user'); // Unified dashboard with dual tabs
  case UserRole.ADMIN:
    redirect('/dashboard/admin');
}
```

#### Unified User Dashboard (`/dashboard/user/page.tsx`)
Supports three user types with tab-based interface:
- **Customers**: Shopping tab only
- **Architect Clients**: Architecture tab only
- **Customer Architect Clients**: Both Shopping and Architecture tabs

## Core Modules

### 1. Authentication & Authorization

#### Authentication Flow
```
User Login → Clerk Authentication → User Profile Creation → Role Assignment → Dashboard Access
```

#### Authorization System
- **RouteGuard Components**: Protect dashboard routes based on user roles
- **API Middleware**: Validate permissions at API level
- **Granular Permissions**: Feature-level access control

### 2. User Management System

#### UserProfile Schema
```typescript
interface UserProfile {
  id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  storeId?: string;           // For sellers
  architectureFirmId?: string; // For architects
  isActive: boolean;
  isVerified: boolean;
  preferences: {
    enableShopping: boolean;
    enableArchitectureServices: boolean;
    defaultDashboard: 'shopping' | 'architecture';
    emailNotifications: boolean;
    smsNotifications: boolean;
    marketingEmails: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### 3. E-commerce Module

#### Store Management
- **Store Registration**: Multi-step application process
- **Product Management**: CRUD operations with categories
- **Order Processing**: Status tracking and notifications
- **Inventory Management**: Stock tracking and alerts
- **Payment Integration**: Stripe-ready architecture

#### Product Schema
```typescript
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  store: StoreReference;
  isActive: boolean;
  inventory: {
    stock: number;
    sku: string;
    trackQuantity: boolean;
  };
  shipping: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### 4. Architecture Services Module

#### Project Management
- **Project Posting**: Clients post architecture requirements
- **Proposal System**: Architects submit detailed proposals
- **Project Tracking**: Status updates and milestone management
- **File Management**: Document sharing and version control

#### Project Schema
```typescript
interface ArchitectureProject {
  _id: string;
  projectTitle: string;
  description: string;
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  timeline: {
    startDate: Date;
    endDate: Date;
  };
  location: {
    address: string;
    city: string;
    state: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  client: {
    clerkId: string;
    name: string;
    email: string;
  };
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  requirements: string[];
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### 5. Notification System

#### Email Templates
- **Transactional Emails**: Order confirmations, status updates
- **Application Notifications**: Store/architecture application status
- **Marketing Emails**: Promotional content (opt-in)
- **System Alerts**: Security and maintenance notifications

#### Template Types
```typescript
enum EmailTemplate {
  SELLER_APPLICATION_RECEIVED = 'sellerApplicationReceived',
  SELLER_APPLICATION_APPROVED = 'sellerApplicationApproved',
  SELLER_APPLICATION_REJECTED = 'sellerApplicationRejected',
  ARCHITECTURE_APPLICATION_RECEIVED = 'architectureApplicationReceived',
  ARCHITECTURE_APPLICATION_APPROVED = 'architectureApplicationApproved',
  NEW_ORDER = 'newOrder',
  NEW_PROJECT_PROPOSAL = 'newProjectProposal',
}
```

## API Architecture

### RESTful API Design

#### Authentication Routes
```
POST /api/users/onboard     # User onboarding
GET  /api/users/profile     # Get user profile
PUT  /api/users/profile     # Update user profile
PUT  /api/users/role        # Role upgrade
GET  /api/users/settings    # User preferences
PUT  /api/users/settings    # Update preferences
```

#### E-commerce Routes
```
GET  /api/stores            # Public store directory
POST /api/stores            # Store registration
GET  /api/store/{id}/stats  # Store analytics
GET  /api/users/orders      # User order history
GET  /api/users/stats       # Shopping statistics
```

#### Architecture Routes
```
GET  /api/architecture/firms        # Architecture firms
POST /api/architecture/projects     # Create project
GET  /api/architecture/projects     # List projects
POST /api/architecture/proposals    # Submit proposal
GET  /api/architecture/client/stats # Client statistics
```

### Response Format Standards

#### Success Response
```typescript
{
  success: true,
  data: T,
  timestamp: string,
}
```

#### Error Response
```typescript
{
  success: false,
  error: {
    message: string,
    code: string,
    timestamp: string,
  }
}
```

#### Paginated Response
```typescript
{
  success: true,
  data: T[],
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  },
  timestamp: string,
}
```

## Caching Strategy

### Multi-Level Caching

#### 1. Redis Cache (Primary)
- **API Responses**: 5-30 minute TTL based on data type
- **User Sessions**: Session management
- **User Preferences**: Quick access to settings
- **Performance Metrics**: Real-time analytics

#### 2. Memory Cache (Fallback)
- **Static Data**: Categories, settings
- **User Preferences**: Local fallback
- **Performance Data**: Temporary metrics storage

#### Cache Invalidation Strategy
```typescript
// Automatic invalidation on data changes
await cache.invalidatePattern(`user:${userId}:*`);
await cache.invalidatePattern('stores:*');
await cache.invalidatePattern('projects:*');
```

## Performance Monitoring

### Metrics Collection
- **API Response Times**: Track endpoint performance
- **Cache Hit Rates**: Monitor caching effectiveness
- **Database Query Performance**: Sanity query optimization
- **User Experience Metrics**: Dashboard load times

### Real-time Monitoring
```typescript
interface PerformanceMetrics {
  endpoint: string;
  responseTime: number;
  cacheHit: boolean;
  error: boolean;
  timestamp: Date;
}
```

## Security Architecture

### Authentication Security
- **Clerk Integration**: Enterprise-grade authentication
- **Session Management**: Secure session handling
- **Multi-factor Authentication**: Ready for implementation
- **Social Login**: Google, GitHub, etc.

### API Security
- **Rate Limiting**: Prevent abuse and DDoS attacks
- **CORS Configuration**: Cross-origin request security
- **Input Validation**: Comprehensive input sanitization
- **SQL Injection Prevention**: Sanity GROQ parameterization

### Data Protection
- **Encryption**: Data in transit and at rest
- **PII Protection**: Personal information handling
- **GDPR Compliance**: Data privacy standards
- **Audit Logging**: User activity tracking

## Deployment Architecture

### Production Environment

#### Recommended Setup
- **Frontend**: Vercel (Edge Network)
- **Backend**: Vercel Serverless Functions
- **Database**: Sanity Managed Cloud
- **Cache**: Upstash Redis (Serverless)
- **CDN**: Sanity Asset CDN + Vercel Edge Network

#### Environment Variables
```env
# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Database
NEXT_PUBLIC_SANITY_PROJECT_ID=
SANITY_API_READ_TOKEN=
SANITY_API_WRITE_TOKEN=

# Email Service
RESEND_API_KEY=
FROM_EMAIL=noreply@interiowale.com

# Cache
REDIS_URL=
REDIS_TOKEN=

# Application
NEXT_PUBLIC_APP_URL=https://interiowale.com
```

### Scaling Considerations

#### Horizontal Scaling
- **Serverless Functions**: Auto-scaling with demand
- **Database Scaling**: Sanity's managed infrastructure
- **Cache Scaling**: Redis clustering capability
- **CDN Scaling**: Global edge network distribution

#### Performance Optimization
- **Code Splitting**: Dynamic imports for dashboard components
- **Image Optimization**: Next.js image optimization
- **Bundle Analysis**: Regular performance audits
- **Caching Strategy**: Multi-level caching implementation

## Development Workflow

### Local Development Setup
```bash
# Install dependencies
npm install

# Environment setup
cp .env.example .env.local

# Development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Building
npm run build
```

### Code Quality Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration with custom rules
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality control

### Testing Strategy
- **Unit Tests**: Core business logic
- **Integration Tests**: API endpoints
- **E2E Tests**: User workflows
- **Performance Tests**: Load and stress testing

## Monitoring & Observability

### Application Monitoring
- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: Real-time performance data
- **User Analytics**: Usage patterns and insights
- **System Health**: Infrastructure monitoring

### Logging Strategy
```typescript
// Structured logging format
{
  timestamp: string,
  level: 'info' | 'warn' | 'error',
  service: string,
  userId?: string,
  action: string,
  metadata: object,
  error?: {
    message: string,
    stack: string,
    code: string
  }
}
```

## Future Enhancements

### Planned Features
1. **Mobile Application**: React Native mobile app
2. **Real-time Chat**: In-app messaging system
3. **Video Consultation**: Virtual meeting integration
4. **AI Recommendations**: Smart product/project suggestions
5. **Multi-currency Support**: International expansion
6. **Advanced Analytics**: Business intelligence dashboard

### Technology Roadmap
1. **Microservices Architecture**: Service decomposition
2. **Event-driven Architecture**: Async processing
3. **GraphQL API**: Flexible data querying
4. **Progressive Web App**: Enhanced mobile experience
5. **Machine Learning**: Personalization engine

## Conclusion

The InterioWale platform architecture is designed for scalability, security, and performance. The unified dashboard system provides seamless user experience across multiple roles while maintaining clean separation of concerns. The modular design allows for easy feature additions and modifications without disrupting existing functionality.

The system leverages modern web technologies and best practices to ensure reliability, maintainability, and excellent user experience. The architecture supports both current requirements and future growth, making it a robust foundation for the multi-tenant marketplace platform.