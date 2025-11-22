export interface CommissionSettings {
  globalCommissionRate: number; // Default 10%
  categoryCommissionRates: {
    [categoryId: string]: number; // Different rates per category
  };
  storeCommissionRates: {
    [storeId: string]: number; // Custom rates per store
  };
  volumeDiscounts: VolumeDiscount[];
}

export interface VolumeDiscount {
  threshold: number; // Monthly sales volume in dollars
  discountRate: number; // Reduced commission percentage
}

export interface StoreEarnings {
  storeId: string;
  storeName: string;
  totalSales: number;
  platformFee: number;
  netEarnings: number;
  pendingBalance: number;
  availableBalance: number;
  lifetimeEarnings: number;
  currentMonthSales: number;
  stripeAccountId?: string;
  payoutSchedule: 'automatic' | 'manual';
  lastPayoutDate?: Date;
  nextPayoutDate?: Date;
}

export interface PayoutRequest {
  _id: string;
  storeId: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: Date;
  processedAt?: Date;
  transferId?: string;
  failureReason?: string;
  bankDetails?: BankDetails;
}

export interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  routingNumber: string;
  bankName: string;
}

export interface Transaction {
  _id: string;
  orderId: string;
  storeId: string;
  amount: number;
  platformFee: number;
  netAmount: number;
  commissionRate: number;
  status: 'pending' | 'completed' | 'refunded';
  paymentIntentId: string;
  createdAt: Date;
  settledAt?: Date;
}

export interface CommissionReport {
  period: {
    start: Date;
    end: Date;
  };
  totalRevenue: number;
  totalCommissions: number;
  storePayouts: number;
  pendingPayouts: number;
  transactionCount: number;
  topStores: {
    storeId: string;
    storeName: string;
    revenue: number;
    commission: number;
  }[];
}