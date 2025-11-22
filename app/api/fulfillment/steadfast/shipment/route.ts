import { NextRequest, NextResponse } from 'next/server';
import { courierService } from '@/lib/fulfillment/courierService';
import { ShipmentDetails } from '@/types/fulfillment';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId,
      deliveryAddress,
      packageDetails,
      serviceType = 'regular',
      specialInstructions
    } = body;

    // Validate required fields
    if (!orderId || !deliveryAddress || !packageDetails) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: orderId, deliveryAddress, packageDetails'
      }, { status: 400 });
    }

    // Validate delivery address
    if (!deliveryAddress.fullName || !deliveryAddress.phone || !deliveryAddress.address || !deliveryAddress.city) {
      return NextResponse.json({
        success: false,
        error: 'Missing required delivery address fields'
      }, { status: 400 });
    }

    // Create shipment data
    const shipmentData = {
      orderId,
      courierService: 'steadfast',
      serviceType,
      deliveryCharge: 0, // Will be calculated by Steadfast
      specialInstructions,
      deliveryAddress,
      packageDetails
    };

    // Create shipment with Steadfast
    const shipment = await courierService.createSteadfastShipment(shipmentData);

    return NextResponse.json({
      success: true,
      data: {
        shipment,
        message: 'Shipment created successfully with Steadfast'
      }
    });

  } catch (error: any) {
    console.error('Error creating Steadfast shipment:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create shipment'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Get Steadfast account balance
    const balance = await courierService.getSteadfastBalance();

    return NextResponse.json({
      success: true,
      data: {
        balance,
        message: 'Steadfast account balance retrieved successfully'
      }
    });

  } catch (error: any) {
    console.error('Error getting Steadfast balance:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to get account balance'
    }, { status: 500 });
  }
}