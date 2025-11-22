import { NextRequest, NextResponse } from 'next/server';
import { courierService } from '@/lib/fulfillment/courierService';

export async function GET(
  request: NextRequest,
  { params }: { params: { trackingId: string } }
) {
  try {
    const trackingId = params.trackingId;

    if (!trackingId) {
      return NextResponse.json({
        success: false,
        error: 'Tracking ID is required'
      }, { status: 400 });
    }

    // Track shipment with Steadfast
    const trackingEvents = await courierService.trackSteadfastShipment(trackingId);

    return NextResponse.json({
      success: true,
      data: {
        trackingId,
        events: trackingEvents,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Error tracking Steadfast shipment:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to track shipment'
    }, { status: 500 });
  }
}