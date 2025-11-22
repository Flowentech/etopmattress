# Multi-Store Implementation Guide

## Architecture Overview

Your InterioWale application now has a complete multi-store marketplace system with three distinct user roles:

### 1. **ADMIN** (Platform Owner)
- Manage all stores and sellers
- Create and manage categories
- Create and manage architect profiles
- Monitor all orders across stores
- Approve/reject seller applications
- Handle disputes and refunds
- View platform-wide analytics
- Manage commission rates

### 2. **SELLER** (Store Owner)
- Manage their own store
- Add/edit/delete products
- Process orders (confirm, ship, deliver)
- View store analytics
- Manage inventory
- Update store settings

### 3. **CUSTOMER** (Buyer)
- Browse products from multiple stores
- Add to cart from different stores
- Place orders
- Track orders
- Review products

---

## Order Fulfillment Flow

```
1. CUSTOMER places order
   ↓
2. Order created (split by store if multi-store cart)
   ↓
3. SELLER receives notification → Status: "pending"
   ↓
4. SELLER confirms order → Status: "confirmed"
   ↓
5. SELLER processes items → Status: "processing"
   ↓
6. SELLER ships order → Status: "shipped"
   ↓
7. CUSTOMER receives → Status: "delivered"
   ↓
8. Transaction complete → Status: "completed"
   ↓
9. ADMIN releases payment to SELLER
```

---

## Implemented Features

### Admin Panel (`/admin`)
✅ **Categories Management** (`/admin/categories`)
- Create, edit, delete categories
- Manage category images and descriptions

✅ **Architect Management** (`/admin/architects`)
- Create architect profiles
- Verify/unverify architects
- Feature architects
- Manage architect portfolios

✅ **Store Management** (`/admin/stores`)
- View all stores
- Approve/reject store applications
- Monitor store performance

✅ **Order Monitoring** (`/admin/orders`)
- View all orders across stores
- Track order status
- Handle disputes

### Seller Panel (`/seller`)
✅ **Order Management** (`/seller/orders`)
- View store orders
- Update order status (pending → confirmed → processing → shipped → delivered)
- Filter orders by status
- View customer details

✅ **Product Management** (`/seller/products`)
- Add/edit/delete products
- Manage inventory
- Set pricing

✅ **Analytics** (`/seller/analytics`)
- View sales metrics
- Track earnings
- Monitor performance

---

## API Routes Created

### Admin APIs
- `GET /api/admin/categories` - List all categories
- `POST /api/admin/categories` - Create category
- `PATCH /api/admin/categories/[id]` - Update category
- `DELETE /api/admin/categories/[id]` - Delete category

- `GET /api/admin/architects` - List all architects
- `POST /api/admin/architects` - Create architect
- `PATCH /api/admin/architects/[id]` - Update architect
- `DELETE /api/admin/architects/[id]` - Delete architect

### Seller APIs
- `GET /api/seller/orders?userId={id}` - Get seller's orders
- `PATCH /api/seller/orders/[id]` - Update order status

---

## Database Schema

### Order Document
```typescript
{
  _type: "order",
  orderNumber: string,
  customerName: string,
  email: string,
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered",
  totalPrice: number,
  products: [{
    product: reference,
    quantity: number
  }],
  store: reference,
  platformFee: number,
  storeEarnings: number,
  payoutStatus: "pending" | "held" | "released" | "paid_out",
  orderUpdates: [{
    status: string,
    message: string,
    timestamp: datetime
  }]
}
```

### Store Document
```typescript
{
  _type: "store",
  name: string,
  owner: {
    userId: string,
    name: string,
    email: string
  },
  settings: {
    isActive: boolean,
    isApproved: boolean,
    commissionRate: number
  },
  financials: {
    totalEarnings: number,
    pendingEarnings: number
  }
}
```

---

## Multi-Store Cart Handling

When a customer adds items from different stores:

1. **Single Checkout** - Customer pays once
2. **Order Splitting** - System creates separate orders per store
3. **Independent Fulfillment** - Each seller manages their portion
4. **Separate Tracking** - Each order has its own tracking

---

## Commission System

- Admin sets commission rate per store (default 10%)
- On order completion:
  - `platformFee = totalPrice * commissionRate`
  - `storeEarnings = totalPrice - platformFee`
- Payout released after delivery confirmation

---

## Next Steps

1. **Add Navigation Links**
   - Update admin sidebar to include Categories and Architects
   - Update seller sidebar to include Orders

2. **Implement Notifications**
   - Email notifications for order status changes
   - Push notifications for sellers

3. **Add Image Upload**
   - Integrate Sanity image upload for categories
   - Add portfolio image upload for architects

4. **Enhance Order Tracking**
   - Add tracking number input
   - Integrate shipping providers
   - Real-time tracking updates

5. **Payment Integration**
   - Connect Stripe for payouts
   - Implement commission calculation
   - Automated payout scheduling

---

## Usage

### Admin Creates Category
1. Go to `/admin/categories`
2. Click "Add Category"
3. Fill in title and description
4. Save

### Admin Creates Architect
1. Go to `/admin/architects`
2. Click "Add Architect"
3. Fill in profile details
4. Mark as verified/featured
5. Save

### Seller Processes Order
1. Go to `/seller/orders`
2. View pending orders
3. Click "Confirm" to accept
4. Click "Start Processing" when preparing
5. Click "Mark as Shipped" when dispatched
6. Click "Mark as Delivered" when received

---

## File Structure

```
app/
├── admin/
│   ├── categories/
│   │   └── page.tsx
│   ├── architects/
│   │   └── page.tsx
│   └── ...
├── seller/
│   ├── orders/
│   │   └── page.tsx
│   └── ...
└── api/
    ├── admin/
    │   ├── categories/
    │   │   ├── route.ts
    │   │   └── [id]/route.ts
    │   └── architects/
    │       ├── route.ts
    │       └── [id]/route.ts
    └── seller/
        └── orders/
            ├── route.ts
            └── [id]/route.ts
```
