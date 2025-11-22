import { CourierService, ShipmentDetails, TrackingEvent, Address } from '@/types/fulfillment';

// Steadfast Courier Service Configuration
export const STEADFAST_CONFIG = {
  id: 'steadfast',
  name: 'Steadfast Bangladesh',
  code: 'STEADFAST',
  logo: '/images/couriers/steadfast.png',
  api: {
    baseUrl: 'https://portal.packzy.com/api/v1',
    apiKey: process.env.STEADFAST_API_KEY || '',
    secretKey: process.env.STEADFAST_SECRET_KEY || '',
    endpoints: {
      createOrder: '/order/create',
      bulkOrder: '/order/create/bulk',
      trackOrder: '/order/status/{tracking_id}',
      getBalance: '/balance',
      getAreas: '/areas',
      createReturn: '/return/create'
    }
  },
  services: {
    standard_delivery: true,
    express_delivery: true,
    same_day: false
  },
  coverage: [
    'dhaka', 'chittagong', 'sylhet', 'rajshahi', 'khulna', 'barisal',
    'rangpur', 'mymensingh', 'narayanganj', 'gazipur', 'comilla',
    'faridpur', 'khulna', 'mymensingh', 'rangpur', 'sylhet'
  ]
};

// Courier service configurations (legacy - keeping for compatibility)
export const COURIER_SERVICES: Record<string, CourierService> = {
  steadfast: {
    id: STEADFAST_CONFIG.id,
    name: STEADFAST_CONFIG.name,
    code: STEADFAST_CONFIG.code,
    logo: STEADFAST_CONFIG.logo,
    trackingApi: {
      baseUrl: STEADFAST_CONFIG.api.baseUrl,
      apiKey: STEADFAST_CONFIG.api.apiKey,
      endpoints: {
        createOrder: STEADFAST_CONFIG.api.endpoints.createOrder,
        trackOrder: STEADFAST_CONFIG.api.endpoints.trackOrder,
        getRates: '/rates' // Not available in Steadfast API
      }
    },
    services: STEADFAST_CONFIG.services,
    coverage: STEADFAST_CONFIG.coverage
  }
};

export class CourierService {

  // Steadfast specific: Create shipment
  async createSteadfastShipment(shipmentData: Omit<ShipmentDetails, 'trackingNumber' | 'status' | 'trackingEvents' | 'createdAt' | 'updatedAt'>): Promise<ShipmentDetails> {
    try {
      const payload = this.formatShipmentForSteadfast(shipmentData);

      const response = await fetch(`${STEADFAST_CONFIG.api.baseUrl}${STEADFAST_CONFIG.api.endpoints.createOrder}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': STEADFAST_CONFIG.api.apiKey,
          'Secret-Key': STEADFAST_CONFIG.api.secretKey,
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Steadfast API error: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();

      return {
        ...shipmentData,
        trackingNumber: result.consignment_id || this.generateTrackingNumber(),
        status: this.mapSteadfastStatus(result.status || 'pending'),
        trackingEvents: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error creating Steadfast shipment:', error);
      throw new Error(`Failed to create Steadfast shipment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create shipment with courier (legacy method)
  async createShipment(shipmentData: Omit<ShipmentDetails, 'trackingNumber' | 'status' | 'trackingEvents' | 'createdAt' | 'updatedAt'>, courierId: string): Promise<ShipmentDetails> {
    if (courierId === 'steadfast') {
      return this.createSteadfastShipment(shipmentData);
    }

    const courier = COURIER_SERVICES[courierId];
    if (!courier) {
      throw new Error('Courier service not found');
    }

    try {
      const response = await fetch(`${courier.trackingApi.baseUrl}${courier.trackingApi.endpoints.createOrder}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${courier.trackingApi.apiKey}`,
        },
        body: JSON.stringify(this.formatShipmentForCourier(shipmentData, courierId))
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Courier API error: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();

      return {
        ...shipmentData,
        trackingNumber: result.tracking_number || result.consignment_no || this.generateTrackingNumber(),
        status: this.mapCourierStatus(result.status || 'pending'),
        trackingEvents: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error creating shipment:', error);
      throw new Error(`Failed to create shipment with ${courier.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Steadfast specific: Track shipment
  async trackSteadfastShipment(trackingNumber: string): Promise<TrackingEvent[]> {
    try {
      const url = STEADFAST_CONFIG.api.endpoints.trackOrder.replace('{tracking_id}', trackingNumber);

      const response = await fetch(`${STEADFAST_CONFIG.api.baseUrl}${url}`, {
        method: 'GET',
        headers: {
          'Api-Key': STEADFAST_CONFIG.api.apiKey,
          'Secret-Key': STEADFAST_CONFIG.api.secretKey,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to track Steadfast shipment: ${response.statusText}`);
      }

      const result = await response.json();
      return this.parseSteadfastTrackingEvents(result);

    } catch (error) {
      console.error('Error tracking Steadfast shipment:', error);
      // Return a mock tracking event for offline scenarios
      return [{
        timestamp: new Date().toISOString(),
        status: 'pending',
        location: 'Processing Center',
        description: 'Shipment information received',
        agent: 'Steadfast'
      }];
    }
  }

  // Track shipment (legacy method)
  async trackShipment(trackingNumber: string, courierId: string): Promise<TrackingEvent[]> {
    if (courierId === 'steadfast') {
      return this.trackSteadfastShipment(trackingNumber);
    }

    const courier = COURIER_SERVICES[courierId];
    if (!courier) {
      throw new Error('Courier service not found');
    }

    try {
      const response = await fetch(`${courier.trackingApi.baseUrl}${courier.trackingApi.endpoints.trackOrder}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${courier.trackingApi.apiKey}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to track shipment: ${response.statusText}`);
      }

      const result = await response.json();
      return this.parseTrackingEvents(result, courierId);

    } catch (error) {
      console.error('Error tracking shipment:', error);
      // Return a mock tracking event for offline scenarios
      return [{
        timestamp: new Date().toISOString(),
        status: 'pending',
        location: 'Processing Center',
        description: 'Shipment information received',
        agent: courier.name
      }];
    }
  }

  // Calculate shipping rates
  async calculateShippingRate(origin: Address, destination: Address, packageDetails: any, courierId: string): Promise<{ rate: number; estimatedDays: number }> {
    const courier = COURIER_SERVICES[courierId];
    if (!courier) {
      return { rate: 100, estimatedDays: 5 }; // Default fallback
    }

    try {
      // Calculate distance-based rate (simplified for demonstration)
      const distance = this.calculateDistance(origin, destination);
      const baseRate = courierId === 'pathao' ? 60 : courierId === 'redx' ? 80 : 100;
      const weightRate = packageDetails.weight * 10; // 10 BDT per kg
      const rate = Math.max(baseRate + weightRate, 50);

      // Calculate estimated delivery days
      const estimatedDays = this.getEstimatedDeliveryDays(destination.city, courierId);

      return { rate, estimatedDays };

    } catch (error) {
      console.error('Error calculating shipping rate:', error);
      return { rate: 100, estimatedDays: 5 };
    }
  }

  // Get available couriers for a route
  async getAvailableCouriers(origin: Address, destination: Address): Promise<CourierService[]> {
    return Object.values(COURIER_SERVICES).filter(courier =>
      courier.coverage.includes(destination.city.toLowerCase())
    );
  }

  // Helper methods
  private formatShipmentForCourier(shipment: any, courierId: string): any {
    const courier = COURIER_SERVICES[courierId];

    // Common format for most couriers
    return {
      consignee_name: shipment.deliveryAddress.fullName,
      consignee_phone: shipment.deliveryAddress.phone,
      consignee_address: shipment.deliveryAddress.address,
      consignee_city: shipment.deliveryAddress.city,
      consignee_area: shipment.deliveryAddress.state,
      consignee_postcode: shipment.deliveryAddress.postalCode,
      consignee_country: shipment.deliveryAddress.country,

      consignor_name: 'InterioWale',
      consignor_phone: '01712345678',
      consignor_address: '123 Business Address',
      consignor_city: 'Dhaka',
      consignor_area: 'Dhaka',
      consignor_postcode: '1000',
      consignor_country: 'Bangladesh',

      package_type: 'standard',
      weight: shipment.packageDetails.weight,
      length: shipment.packageDetails.dimensions.length,
      width: shipment.packageDetails.dimensions.width,
      height: shipment.packageDetails.dimensions.height,
      description: shipment.packageDetails.description,
      declared_value: shipment.packageDetails.value,

      service_type: shipment.serviceType,
      special_instructions: shipment.specialInstructions,

      // Courier-specific fields would go here
      ...(courierId === 'pathao' && {
        recipient_name: shipment.deliveryAddress.fullName,
        recipient_phone: shipment.deliveryAddress.phone,
        recipient_address: shipment.deliveryAddress.address,
        recipient_city: shipment.deliveryAddress.city,
        recipient_area: shipment.deliveryAddress.state,
        recipient_zone: shipment.deliveryAddress.state
      })
    };
  }

  private parseTrackingEvents(result: any, courierId: string): TrackingEvent[] {
    // Different couriers return different response formats
    if (courierId === 'pathao') {
      return result.data?.tracking?.map((event: any) => ({
        timestamp: event.timestamp || event.date,
        status: event.status,
        location: event.location || event.hub,
        description: event.description || event.remarks,
        agent: event.agent || 'Pathao',
        remarks: event.remarks
      })) || [];
    }

    // Default parsing
    return Array.isArray(result) ? result.map(event => ({
      timestamp: event.timestamp || event.date || new Date().toISOString(),
      status: event.status || 'unknown',
      location: event.location || 'Unknown',
      description: event.description || event.message || 'Package updated',
      agent: event.agent || courierId.toUpperCase(),
      remarks: event.remarks
    })) : [];
  }

  private mapCourierStatus(status: string): string {
    const statusMap: Record<string, string> = {
      // Pathao
      'pending': 'pending',
      'booked': 'booked',
      'picked': 'picked_up',
      'in_transit': 'in_transit',
      'out_for_delivery': 'out_for_delivery',
      'delivered': 'delivered',

      // Common alternatives
      'order_placed': 'pending',
      'package_received': 'booked',
      'picked_up': 'picked_up',
      'in_transit': 'in_transit',
      'out_for_delivery': 'out_for_delivery',
      'delivered': 'delivered',
      'delivered_successfully': 'delivered'
    };

    return statusMap[status?.toLowerCase()] || status || 'pending';
  }

  private generateTrackingNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const trackingId = timestamp.slice(-7) + random;

    return `IW-${trackingId}`;
  }

  private calculateDistance(origin: Address, destination: Address): number {
    // Simplified distance calculation (would use actual distance API in production)
    // This is a placeholder - in production you'd use Google Maps API or similar
    const cityDistance: Record<string, number> = {
      'dhaka': 0,
      'chittagong': 250,
      'sylhet': 230,
      'rajshahi': 200,
      'khulna': 340,
      'barisal': 200,
      'rangpur': 250,
      'mymensingh': 120
    };

    const originCity = origin.city.toLowerCase();
    const destCity = destination.city.toLowerCase();

    return Math.abs((cityDistance[originCity] || 0) - (cityDistance[destCity] || 0));
  }

  private getEstimatedDeliveryDays(city: string, courierId: string): number {
    const baseDeliveryDays: Record<string, number> = {
      'dhaka': courierId === 'pathao' ? 1 : 2,
      'chittagong': courierId === 'pathao' ? 2 : 3,
      'sylhet': 3,
      'rajshahi': 3,
      'khulna': 4,
      'barisal': 4,
      'rangpur': 4,
      'mymensingh': 2
    };

    return baseDeliveryDays[city.toLowerCase()] || 5;
  }

  // Steadfast specific helper methods
  private formatShipmentForSteadfast(shipment: any): any {
    return {
      invoice: shipment.orderId,
      recipient_name: shipment.deliveryAddress.fullName,
      recipient_phone: shipment.deliveryAddress.phone,
      recipient_address: shipment.deliveryAddress.address,
      recipient_city: shipment.deliveryAddress.city,
      recipient_area: shipment.deliveryAddress.state,
      recipient_thana: shipment.deliveryAddress.state || shipment.deliveryAddress.city,
      recipient_zip: shipment.deliveryAddress.postalCode || 'N/A',
      cod_amount: shipment.packageDetails.value || 0,
      delivery_type: shipment.serviceType === 'express' ? 'express' : 'regular',
      package_weight: shipment.packageDetails.weight || 1,
      package_description: shipment.packageDetails.description || 'Electronics/Furniture',
      special_instruction: shipment.specialInstructions || '',
      value: shipment.packageDetails.value || 0
    };
  }

  private parseSteadfastTrackingEvents(result: any): TrackingEvent[] {
    if (!result || !result.data) {
      return [{
        timestamp: new Date().toISOString(),
        status: 'pending',
        location: 'Processing Center',
        description: 'Shipment information received',
        agent: 'Steadfast'
      }];
    }

    const data = result.data;
    const events: TrackingEvent[] = [];

    // Main status event
    if (data.status) {
      events.push({
        timestamp: data.updated_at || new Date().toISOString(),
        status: this.mapSteadfastStatus(data.status),
        location: data.delivery_hub || 'Processing Center',
        description: this.getSteadfastStatusDescription(data.status),
        agent: 'Steadfast',
        remarks: data.remarks || ''
      });
    }

    // Delivery event if delivered
    if (data.status === 'delivered' && data.delivery_date) {
      events.push({
        timestamp: data.delivery_date,
        status: 'delivered',
        location: data.delivery_address || 'Customer Address',
        description: 'Package successfully delivered',
        agent: 'Steadfast'
      });
    }

    return events.length > 0 ? events : [{
      timestamp: new Date().toISOString(),
      status: 'pending',
      location: 'Processing Center',
      description: 'Shipment information received',
      agent: 'Steadfast'
    }];
  }

  private mapSteadfastStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'pending',
      'processing': 'booked',
      'picked': 'picked_up',
      'shipped': 'in_transit',
      'in_transit': 'in_transit',
      'out_for_delivery': 'out_for_delivery',
      'delivered': 'delivered',
      'cancelled': 'cancelled',
      'returned': 'returned',
      'hold': 'failed_attempt'
    };

    return statusMap[status?.toLowerCase()] || status || 'pending';
  }

  private getSteadfastStatusDescription(status: string): string {
    const descriptionMap: Record<string, string> = {
      'pending': 'Order placed, awaiting processing',
      'processing': 'Order is being processed',
      'picked': 'Package picked up from sender',
      'shipped': 'Package shipped to destination',
      'in_transit': 'Package in transit',
      'out_for_delivery': 'Package out for delivery',
      'delivered': 'Package delivered successfully',
      'cancelled': 'Order cancelled',
      'returned': 'Package returned to sender',
      'hold': 'Package on hold - delivery attempt failed'
    };

    return descriptionMap[status?.toLowerCase()] || 'Status updated';
  }

  // Steadfast specific: Get balance
  async getSteadfastBalance(): Promise<{ balance: number; currency: string }> {
    try {
      const response = await fetch(`${STEADFAST_CONFIG.api.baseUrl}${STEADFAST_CONFIG.api.endpoints.getBalance}`, {
        method: 'GET',
        headers: {
          'Api-Key': STEADFAST_CONFIG.api.apiKey,
          'Secret-Key': STEADFAST_CONFIG.api.secretKey,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get Steadfast balance: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        balance: result.balance || 0,
        currency: 'BDT'
      };

    } catch (error) {
      console.error('Error getting Steadfast balance:', error);
      return { balance: 0, currency: 'BDT' };
    }
  }

  // Steadfast specific: Get available areas
  async getSteadfastAreas(city?: string): Promise<any[]> {
    try {
      const url = city ? `${STEADFAST_CONFIG.api.endpoints.getAreas}?city=${city}` : STEADFAST_CONFIG.api.endpoints.getAreas;

      const response = await fetch(`${STEADFAST_CONFIG.api.baseUrl}${url}`, {
        method: 'GET',
        headers: {
          'Api-Key': STEADFAST_CONFIG.api.apiKey,
          'Secret-Key': STEADFAST_CONFIG.api.secretKey,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get Steadfast areas: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data || [];

    } catch (error) {
      console.error('Error getting Steadfast areas:', error);
      return [];
    }
  }

  // Steadfast specific: Create return request
  async createSteadfastReturn(trackingId: string, reason: string): Promise<any> {
    try {
      const response = await fetch(`${STEADFAST_CONFIG.api.baseUrl}${STEADFAST_CONFIG.api.endpoints.createReturn}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': STEADFAST_CONFIG.api.apiKey,
          'Secret-Key': STEADFAST_CONFIG.api.secretKey,
        },
        body: JSON.stringify({
          tracking_id: trackingId,
          reason: reason
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Steadfast return API error: ${errorData.message || response.statusText}`);
      }

      return await response.json();

    } catch (error) {
      console.error('Error creating Steadfast return:', error);
      throw new Error(`Failed to create return request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const courierService = new CourierService();