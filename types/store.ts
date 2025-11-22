export interface ShippingRate {
  name: string;
  price: number;
  estimatedDays: string;
  regions: string[];
}

export interface StoreBranding {
  primaryColor: string;
  secondaryColor: string;
  customCSS?: string;
}

export interface StoreShipping {
  freeShippingThreshold?: number;
  shippingRates: ShippingRate[];
}

export interface StoreSettings {
  isActive: boolean;
  isApproved: boolean;
  commissionRate: number;
  categories: string[];
  branding: StoreBranding;
  shipping: StoreShipping;
}

export interface StoreOwner {
  userId: string;
  name: string;
  email: string;
}

export interface StoreFinancials {
  stripeAccountId?: string;
  totalEarnings: number;
  pendingEarnings: number;
  lastPayoutDate?: Date;
}

export interface StoreStats {
  totalProducts: number;
  totalOrders: number;
  monthlyRevenue: number;
  rating: number;
  reviewCount: number;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo?: string;
  banner?: string;
  owner: StoreOwner;
  settings: StoreSettings;
  financials: StoreFinancials;
  stats: StoreStats;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'store_owner' | 'store_manager' | 'employee' | 'supreme_admin';
  storeId?: string;
  registeredAt: Date;
  lastLogin?: Date;
  status: 'active' | 'inactive' | 'banned';
  totalOrders: number;
  totalSpent: number;
  aiCreditsUsed: number;
}

export interface CustomerInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface OrderAmounts {
  subtotal: number;
  platformFee: number;
  storeEarnings: number;
  total: number;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface PlatformOrder {
  id: string;
  storeId: string;
  storeName: string;
  customerInfo: CustomerInfo;
  items: OrderItem[];
  amounts: OrderAmounts;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  orderDate: Date;
}

export interface PlatformCreditAnalytics {
  totalCreditsSold: number;
  totalCreditsUsed: number;
  revenueFromCredits: number;
  profitMargin: number;
  creditsByStore: {
    [storeId: string]: {
      sold: number;
      used: number;
      revenue: number;
    };
  };
}

export interface UserRole {
  id: string;
  userId: string;
  storeId?: string;
  role: string;
  permissions: string[];
  createdAt: Date;
}

export interface TransactionAmounts {
  orderTotal: number;
  platformFee: number;
  storeEarnings: number;
  commissionRate: number;
}

export interface TransactionDates {
  processedAt: Date;
  settledAt?: Date;
  payoutAt?: Date;
}

export interface Transaction {
  id: string;
  orderId: string;
  storeId: string;
  amounts: TransactionAmounts;
  status: 'pending' | 'settled' | 'paid_out';
  dates: TransactionDates;
}

export interface ApplicantInfo {
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  clerkId?: string;
}

export interface BusinessInfo {
  businessName?: string;
  businessType?: string;
  taxId?: string;
  registrationNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

export interface StoreInfo {
  storeName?: string;
  storeDescription?: string;
  categories?: string[];
  estimatedMonthlyVolume?: number;
}

export interface StoreApplication {
  _id?: string; // Sanity document ID
  id?: string; // Alternative ID field
  applicantInfo: ApplicantInfo;
  businessInfo: BusinessInfo;
  storeInfo: StoreInfo;
  documents?: string[];
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  reviewNotes?: string;
  submittedAt: Date | string;
  reviewedAt?: Date | string;
  reviewedBy?: string;
}