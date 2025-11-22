export interface CourierService {
  id: string;
  name: string;
  code: string;
  logo?: string;
  trackingApi: {
    baseUrl: string;
    apiKey: string;
    endpoints: {
      createOrder: string;
      trackOrder: string;
      getRates: string;
    };
  };
  services: {
    standard_delivery: boolean;
    express_delivery: boolean;
    same_day: boolean;
  };
  coverage: string[];
}

export interface ShipmentDetails {
  orderId: string;
  courierService: string;
  serviceType: 'standard' | 'express' | 'same_day';
  trackingNumber?: string;
  estimatedDelivery?: string;
  deliveryCharge: number;
  insuranceValue?: number;
  specialInstructions?: string;
  pickupAddress?: Address;
  deliveryAddress: Address;
  packageDetails: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    description: string;
    value: number;
  };
  status: ShipmentStatus;
  trackingEvents: TrackingEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface TrackingEvent {
  timestamp: string;
  status: string;
  location: string;
  description: string;
  agent?: string;
  remarks?: string;
}

export enum ShipmentStatus {
  PENDING = 'pending',
  BOOKED = 'booked',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  FAILED_ATTEMPT = 'failed_attempt',
  RETURNED = 'returned',
  CANCELLED = 'cancelled'
}

export interface Address {
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface FulfillmentDashboard {
  ordersToProcess: Order[];
  ordersInTransit: Order[];
  deliveredOrders: Order[];
  pendingPickups: ShipmentDetails[];
  failedDeliveries: ShipmentDetails[];
  statistics: {
    totalOrders: number;
    processedToday: number;
    inTransit: number;
    delivered: number;
    failedDeliveryRate: number;
    averageDeliveryTime: number;
  };
}

export interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  customerEmail: string;
  storeId: string;
  totalAmount: number;
  items: OrderItem[];
  deliveryAddress: Address;
  trackingNumber?: string;
  estimatedDelivery?: string;
  shipmentDetails?: ShipmentDetails;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  sellerId: string;
  storeId: string;
}