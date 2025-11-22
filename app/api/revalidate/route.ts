import { NextRequest, NextResponse } from "next/server";
import { revalidateAll, revalidateCategories, revalidateProducts } from "@/lib/cache";

export async function POST(request: NextRequest) {
  try {
    // Verify the webhook secret for security
    const secret = request.nextUrl.searchParams.get('secret');
    if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
      return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
    }

    const body = await request.json();
    const documentType = body._type;

    // Revalidate cache based on document type
    switch (documentType) {
      case 'product':
        revalidateProducts();
        console.log('Revalidated product cache');
        break;
      case 'category':
        revalidateCategories();
        console.log('Revalidated category cache');
        break;
      default:
        revalidateAll();
        console.log('Revalidated all cache');
    }

    return NextResponse.json({ 
      message: 'Cache revalidated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Cache revalidation error:', error);
    return NextResponse.json(
      { message: 'Error revalidating cache' },
      { status: 500 }
    );
  }
}