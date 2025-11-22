/**
 * Generate a human-readable order number
 * Format: IW-YYYY-MM-XXXXX
 * Example: IW-2024-01-00001
 */
export function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  // Generate a random 5-digit number
  const randomNumber = Math.floor(Math.random() * 99999) + 1;
  const orderSequence = String(randomNumber).padStart(5, '0');
  
  return `IW-${year}-${month}-${orderSequence}`;
}

/**
 * Generate a tracking number for delivery
 * Format: TR-XXXXXXXXXX
 */
export function generateTrackingNumber(): string {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const trackingId = timestamp.slice(-7) + random;
  
  return `TR-${trackingId}`;
}

/**
 * Get order status color for UI
 */
export function getOrderStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800", 
    paid: "bg-green-100 text-green-800",
    processing: "bg-indigo-100 text-indigo-800",
    shipped: "bg-purple-100 text-purple-800",
    out_for_delivery: "bg-orange-100 text-orange-800",
    delivered: "bg-green-100 text-green-800",
    cod_collected: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };
  
  return statusColors[status] || "bg-gray-100 text-gray-800";
}

/**
 * Get order status display text
 */
export function getOrderStatusText(status: string): string {
  const statusTexts: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    paid: "Paid",
    processing: "Processing",
    shipped: "Shipped",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered", 
    cod_collected: "Payment Collected",
    cancelled: "Cancelled",
  };
  
  return statusTexts[status] || status;
}

/**
 * Calculate estimated delivery date
 */
export function calculateEstimatedDelivery(orderDate: Date, city: string = ""): Date {
  const deliveryDays: Record<string, number> = {
    dhaka: 1,
    chittagong: 2,
    sylhet: 3,
    rajshahi: 3,
    khulna: 3,
    barisal: 4,
    rangpur: 4,
    mymensingh: 2,
  };
  
  const cityLower = city.toLowerCase();
  const daysToAdd = deliveryDays[cityLower] || 5; // Default 5 days for other cities
  
  const estimatedDate = new Date(orderDate);
  estimatedDate.setDate(estimatedDate.getDate() + daysToAdd);
  
  return estimatedDate;
}