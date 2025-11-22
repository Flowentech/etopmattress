# 💰 Commission & Payment System Documentation

## 🎯 **Overview**

The InterioWale commission system enables you (Supreme Admin) to earn a percentage from every sale made by store owners on your marketplace platform, with automated payment processing and a 14-day hold period for security.

---

## 🏗️ **System Architecture**

### **Payment Flow:**
```
Customer Purchase ($100)
↓
Payment to Platform Stripe Account
↓
Platform Fee Deducted ($10 - 10% commission)
↓
Store Earnings Held for 14 days ($90)
↓
After 14 days:
├── Store has Stripe Connect → Auto transfer
└── Store without Stripe → Manual payout request
```

### **Commission Structure:**
```typescript
interface CommissionSettings {
  globalRate: number;                    // Default commission rate (10%)
  categoryRates: Record<string, number>; // Different rates per category
  storeRates: Record<string, number>;    // Custom rates per store
  volumeDiscounts: VolumeDiscount[];     // Bulk discount tiers
}

interface VolumeDiscount {
  monthlyThreshold: number;  // Minimum monthly sales volume
  discountRate: number;      // Reduced commission rate
}
```

---

## 💳 **Payment Processing**

### **Stripe Integration:**

#### **Platform Account Setup:**
```typescript
// Your main Stripe account receives all payments
const platformStripeAccount = {
  accountId: "acct_your_platform_account",
  type: "express", // or "standard"
  capabilities: [
    "card_payments",
    "transfers"
  ]
};
```

#### **Store Owner Stripe Connect:**
```typescript
// Each store owner can connect their Stripe account
const storeStripeConnect = {
  accountId: "acct_store_owner_account", 
  type: "express",
  onboardingComplete: true,
  payoutsEnabled: true
};
```

### **Payment Processing Logic:**

```typescript
class PaymentProcessor {
  async processOrderPayment(order: Order): Promise<Transaction> {
    const { totalAmount, storeId } = order;
    
    // Get commission rate for this store/category
    const commissionRate = await this.getCommissionRate(storeId, order.items);
    
    // Calculate amounts
    const platformFee = totalAmount * commissionRate;
    const storeEarnings = totalAmount - platformFee;
    const processingFee = this.calculateStripeProcessingFee(totalAmount);
    
    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'usd',
      application_fee_amount: Math.round(platformFee * 100),
      transfer_data: {
        destination: storeConnectedAccountId,
      },
      metadata: {
        orderId: order.id,
        storeId: order.storeId,
        platformFee: platformFee.toString(),
        storeEarnings: storeEarnings.toString()
      }
    });
    
    // Create transaction record
    const transaction = await this.createTransaction({
      orderId: order.id,
      storeId,
      amounts: {
        orderTotal: totalAmount,
        platformFee,
        storeEarnings,
        processingFee
      },
      status: 'pending',
      paymentIntentId: paymentIntent.id,
      releaseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
    });
    
    return transaction;
  }
  
  private async getCommissionRate(storeId: string, items: OrderItem[]): Promise<number> {
    // Check for store-specific rate
    const storeRate = await this.getStoreCommissionRate(storeId);
    if (storeRate) return storeRate;
    
    // Check category-specific rates
    const categoryRate = await this.getCategoryCommissionRate(items);
    if (categoryRate) return categoryRate;
    
    // Fall back to global rate
    return this.globalCommissionRate;
  }
}
```

---

## ⏰ **14-Day Hold System**

### **Hold Period Logic:**

```typescript
interface TransactionHold {
  transactionId: string;
  holdStartDate: Date;
  releaseDate: Date;      // 14 days after order
  status: 'held' | 'released' | 'disputed';
  reason: 'standard_hold' | 'fraud_review' | 'dispute';
}

class HoldManager {
  async processReleasableTransactions(): Promise<void> {
    // Run this daily via cron job
    const releasableTransactions = await this.getReleasableTransactions();
    
    for (const transaction of releasableTransactions) {
      await this.releaseTransaction(transaction);
    }
  }
  
  async releaseTransaction(transaction: Transaction): Promise<void> {
    const store = await this.getStore(transaction.storeId);
    
    if (store.stripeConnectAccountId) {
      // Automatic transfer via Stripe Connect
      await this.transferToStripeConnect(transaction);
    } else {
      // Mark as available for manual payout
      await this.markForManualPayout(transaction);
    }
    
    await this.updateTransactionStatus(transaction.id, 'released');
  }
  
  async transferToStripeConnect(transaction: Transaction): Promise<void> {
    await stripe.transfers.create({
      amount: Math.round(transaction.amounts.storeEarnings * 100),
      currency: 'usd',
      destination: store.stripeConnectAccountId,
      metadata: {
        transactionId: transaction.id,
        orderId: transaction.orderId
      }
    });
  }
}
```

### **Hold Reasons:**
- **Standard Hold** - 14 days for all transactions
- **Fraud Review** - Extended hold for suspicious activity
- **Dispute Hold** - Hold during chargeback/dispute
- **Manual Review** - Admin-requested hold

---

## 🏦 **Payout Management**

### **Automatic Payouts (Stripe Connect):**

```typescript
interface StripeConnectPayout {
  storeId: string;
  stripeAccountId: string;
  amount: number;
  currency: 'usd';
  transferDate: Date;
  transferId: string;
  status: 'pending' | 'paid' | 'failed';
}
```

### **Manual Payout Requests:**

```typescript
interface PayoutRequest {
  id: string;
  storeId: string;
  requestedAmount: number;
  availableAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  
  requestDate: Date;
  reviewDate?: Date;
  payoutDate?: Date;
  
  bankDetails: {
    accountHolderName: string;
    accountNumber: string;
    routingNumber: string;
    bankName: string;
  };
  
  notes?: string;
  rejectionReason?: string;
}

class PayoutManager {
  async requestPayout(storeId: string, amount: number, bankDetails: BankDetails): Promise<PayoutRequest> {
    const availableAmount = await this.getAvailableEarnings(storeId);
    
    if (amount > availableAmount) {
      throw new Error('Requested amount exceeds available earnings');
    }
    
    const payoutRequest = await this.createPayoutRequest({
      storeId,
      requestedAmount: amount,
      availableAmount,
      bankDetails,
      status: 'pending',
      requestDate: new Date()
    });
    
    // Notify admin of payout request
    await this.notifyAdminOfPayoutRequest(payoutRequest);
    
    return payoutRequest;
  }
  
  async approvePayoutRequest(requestId: string, adminUserId: string): Promise<void> {
    const request = await this.getPayoutRequest(requestId);
    
    // Process bank transfer (via your banking provider)
    await this.processBankTransfer(request);
    
    // Update request status
    await this.updatePayoutRequest(requestId, {
      status: 'approved',
      reviewDate: new Date(),
      approvedBy: adminUserId
    });
    
    // Deduct from store balance
    await this.deductFromStoreBalance(request.storeId, request.requestedAmount);
  }
}
```

---

## 📊 **Financial Tracking**

### **Transaction Schema:**

```typescript
interface Transaction {
  id: string;
  orderId: string;
  storeId: string;
  customerId: string;
  
  amounts: {
    orderTotal: number;           // $100.00
    platformFee: number;          // $10.00 (your commission)
    storeEarnings: number;        // $90.00
    stripeFee: number;            // $3.20 (Stripe processing fee)
    netStoreEarnings: number;     // $86.80 (after Stripe fee)
  };
  
  dates: {
    orderDate: Date;
    holdStartDate: Date;
    releaseDate: Date;           // 14 days after order
    paidOutDate?: Date;
  };
  
  status: 'pending' | 'held' | 'released' | 'paid_out' | 'disputed';
  
  paymentDetails: {
    stripePaymentIntentId: string;
    stripeTransferId?: string;
    payoutMethod: 'stripe_connect' | 'manual_transfer';
  };
  
  metadata: {
    commissionRate: number;      // Rate used for this transaction
    volumeDiscountApplied?: boolean;
    notes?: string;
  };
}
```

### **Financial Reports:**

```typescript
interface FinancialSummary {
  timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  
  platformMetrics: {
    totalGMV: number;            // Gross Merchandise Volume
    totalCommissionEarned: number;
    averageCommissionRate: number;
    totalTransactions: number;
  };
  
  storeMetrics: {
    totalStoresActive: number;
    totalEarningsPaidOut: number;
    averageEarningsPerStore: number;
    pendingPayouts: number;
  };
  
  breakdown: {
    byCategory: Record<string, number>;
    byStore: Record<string, number>;
    byPaymentMethod: Record<string, number>;
  };
}
```

---

## ⚙️ **Commission Configuration**

### **Admin Interface:**

```typescript
class CommissionController {
  async updateGlobalCommissionRate(newRate: number): Promise<void> {
    if (newRate < 0 || newRate > 0.3) {
      throw new Error('Commission rate must be between 0% and 30%');
    }
    
    await this.updateSettings({ globalCommissionRate: newRate });
    
    // Log the change
    await this.logCommissionRateChange({
      type: 'global',
      oldRate: this.currentGlobalRate,
      newRate,
      changedBy: this.currentAdminId,
      effectiveDate: new Date()
    });
  }
  
  async setStoreCommissionRate(storeId: string, rate: number): Promise<void> {
    await this.updateStoreSettings(storeId, { commissionRate: rate });
    
    // Notify store owner of rate change
    await this.notifyStoreOwner(storeId, {
      type: 'commission_rate_change',
      newRate: rate,
      effectiveDate: new Date()
    });
  }
  
  async setCategoryCommissionRate(categoryId: string, rate: number): Promise<void> {
    await this.updateCategorySettings(categoryId, { commissionRate: rate });
  }
}
```

### **Volume Discounts:**

```typescript
interface VolumeDiscountTier {
  name: string;
  monthlyThreshold: number;     // Minimum monthly GMV
  discountRate: number;         // Reduced commission rate
  benefits: string[];           // Additional perks
}

const volumeDiscountTiers: VolumeDiscountTier[] = [
  {
    name: 'Bronze',
    monthlyThreshold: 10000,     // $10K/month
    discountRate: 0.09,          // 9% commission (down from 10%)
    benefits: ['Priority support', 'Monthly analytics report']
  },
  {
    name: 'Silver', 
    monthlyThreshold: 50000,     // $50K/month
    discountRate: 0.08,          // 8% commission
    benefits: ['Dedicated account manager', 'Custom branding', 'API access']
  },
  {
    name: 'Gold',
    monthlyThreshold: 100000,    // $100K/month
    discountRate: 0.07,          // 7% commission
    benefits: ['White-label options', 'Custom domain', 'Priority processing']
  }
];
```

---

## 🔔 **Notifications & Alerts**

### **Automated Notifications:**

```typescript
interface NotificationEvent {
  type: 'transaction_created' | 'funds_released' | 'payout_requested' | 
        'payout_completed' | 'commission_rate_changed' | 'low_balance_alert';
  
  recipients: ('store_owner' | 'supreme_admin')[];
  
  data: {
    amount?: number;
    storeId?: string;
    transactionId?: string;
    message: string;
  };
  
  channels: ('email' | 'in_app' | 'sms')[];
}

class NotificationService {
  async notifyTransactionCreated(transaction: Transaction): Promise<void> {
    // Notify store owner
    await this.sendNotification({
      type: 'transaction_created',
      recipients: ['store_owner'],
      data: {
        amount: transaction.amounts.storeEarnings,
        storeId: transaction.storeId,
        transactionId: transaction.id,
        message: `New sale: $${transaction.amounts.orderTotal}. Your earnings: $${transaction.amounts.storeEarnings} (available in 14 days)`
      },
      channels: ['email', 'in_app']
    });
  }
  
  async notifyPayoutCompleted(payout: PayoutRequest): Promise<void> {
    await this.sendNotification({
      type: 'payout_completed',
      recipients: ['store_owner'],
      data: {
        amount: payout.requestedAmount,
        storeId: payout.storeId,
        message: `Payout of $${payout.requestedAmount} has been sent to your bank account`
      },
      channels: ['email', 'in_app', 'sms']
    });
  }
}
```

---

## 📈 **Analytics & Reporting**

### **Supreme Admin Analytics:**

```typescript
interface PlatformAnalytics {
  revenue: {
    totalCommissionEarned: number;
    monthlyRecurringCommission: number;
    commissionGrowthRate: number;
    topPerformingStores: Store[];
  };
  
  payouts: {
    totalPayoutsPending: number;
    totalPayoutsCompleted: number;
    averagePayoutTime: number;    // Days
    payoutRequestsThisMonth: number;
  };
  
  stores: {
    totalActiveStores: number;
    newStoresThisMonth: number;
    storeChurnRate: number;
    averageStoreRevenue: number;
  };
}
```

### **Store Owner Analytics:**

```typescript
interface StoreAnalytics {
  earnings: {
    totalEarningsToDate: number;
    pendingEarnings: number;
    availableForPayout: number;
    lastPayoutDate?: Date;
  };
  
  commissions: {
    currentCommissionRate: number;
    totalCommissionsPaid: number;
    volumeDiscountEligible: boolean;
    nextDiscountTier?: VolumeDiscountTier;
  };
  
  performance: {
    monthlyGMV: number;
    transactionCount: number;
    averageOrderValue: number;
    commissionEffectiveRate: number;
  };
}
```

---

## 🛡️ **Security & Compliance**

### **Financial Security:**
- **PCI DSS Compliance** - All payment data secured
- **Fraud Detection** - Unusual transaction patterns
- **Hold Periods** - 14-day security window
- **Audit Trail** - Complete transaction history

### **Dispute Management:**
```typescript
interface DisputeCase {
  id: string;
  transactionId: string;
  type: 'chargeback' | 'refund_request' | 'fraud_claim';
  status: 'open' | 'under_review' | 'resolved' | 'lost';
  
  amounts: {
    originalTransaction: number;
    disputedAmount: number;
    platformLiability: number;
    storeLiability: number;
  };
  
  timeline: {
    openedDate: Date;
    dueDate: Date;
    resolvedDate?: Date;
  };
  
  evidence: {
    documents: string[];
    merchantResponse: string;
    customerCommunication: string[];
  };
}
```

---

## 🚀 **Implementation Checklist**

### **Phase 1: Core Commission System**
- ✅ Commission calculation engine
- ✅ Transaction recording
- ✅ Basic hold system
- ✅ Stripe integration

### **Phase 2: Payout Management**
- ✅ Stripe Connect setup
- ✅ Manual payout requests
- ✅ Bank transfer processing
- ✅ Payout approval workflow

### **Phase 3: Advanced Features**
- ✅ Volume discounts
- ✅ Category-specific rates
- ✅ Analytics dashboard
- ✅ Notification system

### **Phase 4: Compliance & Security**
- ✅ Fraud detection
- ✅ Dispute management
- ✅ Audit logging
- ✅ Compliance reports

---

This commission system ensures you earn sustainable revenue from your marketplace while providing transparent, secure payouts to your store owners! 💰