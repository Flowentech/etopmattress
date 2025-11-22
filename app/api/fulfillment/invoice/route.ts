import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';
import { invoiceGenerator, InvoiceData } from '@/lib/invoice/generator';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const orderId = searchParams.get('orderId');

    if (!storeId || !orderId) {
      return NextResponse.json({
        success: false,
        error: 'storeId and orderId are required'
      }, { status: 400 });
    }

    // Fetch order details
    const orderQuery = `
      *[_type == "order" && _id == $orderId && store._ref == $storeId][0] {
        _id,
        orderNumber,
        status,
        customerName,
        customerEmail,
        customerPhone,
        totalAmount,
        items[]{
          productId,
          productName,
          quantity,
          price,
          sellerId,
          storeId
        },
        deliveryAddress{
          fullName,
          phone,
          email,
          address,
          city,
          state,
          postalCode,
          country
        },
        trackingNumber,
        estimatedDelivery,
        paymentMethod,
        paymentStatus,
        paidAt,
        shippingCharge,
        createdAt,
        updatedAt
      }
    `;

    const order = await client.fetch(orderQuery, { orderId, storeId });

    if (!order) {
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 });
    }

    // Fetch store information
    const storeQuery = `
      *[_type == "store" && _id == $storeId][0] {
        _id,
        name,
        email,
        phone,
        address,
        tradeLicense
      }
    `;

    const store = await client.fetch(storeQuery, { storeId });

    if (!store) {
      return NextResponse.json({
        success: false,
        error: 'Store not found'
      }, { status: 404 });
    }

    // Prepare invoice data
    const invoiceData: InvoiceData = {
      order: {
        ...order,
        storeId: storeId
      },
      sellerInfo: {
        storeName: store.name,
        email: store.email,
        phone: store.phone || 'N/A',
        address: store.address || 'N/A',
        tradeLicense: store.tradeLicense
      },
      paymentInfo: {
        method: order.paymentMethod || 'Cash on Delivery',
        status: order.paymentStatus || 'pending',
        paidAt: order.paidAt
      },
      shippingInfo: {
        method: 'Home Delivery',
        charge: order.shippingCharge || 0,
        trackingNumber: order.trackingNumber,
        estimatedDelivery: order.estimatedDelivery
      }
    };

    return NextResponse.json({
      success: true,
      data: invoiceData
    });

  } catch (error) {
    console.error('Error generating invoice:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate invoice'
    }, { status: 500 });
  }
}