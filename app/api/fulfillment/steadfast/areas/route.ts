import { NextRequest, NextResponse } from 'next/server';
import { courierService } from '@/lib/fulfillment/courierService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');

    // Get available areas from Steadfast
    const areas = await courierService.getSteadfastAreas(city || undefined);

    return NextResponse.json({
      success: true,
      data: {
        areas,
        city: city || 'all',
        count: areas.length
      }
    });

  } catch (error: any) {
    console.error('Error getting Steadfast areas:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to get areas'
    }, { status: 500 });
  }
}