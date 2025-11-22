import { NextRequest, NextResponse } from 'next/server';
import { courierService } from '@/lib/fulfillment/courierService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trackingId, reason } = body;

    // Validate required fields
    if (!trackingId || !reason) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: trackingId, reason'
      }, { status: 400 });
    }

    // Create return request with Steadfast
    const returnRequest = await courierService.createSteadfastReturn(trackingId, reason);

    return NextResponse.json({
      success: true,
      data: {
        returnRequest,
        message: 'Return request created successfully'
      }
    });

  } catch (error: any) {
    console.error('Error creating Steadfast return:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create return request'
    }, { status: 500 });
  }
}