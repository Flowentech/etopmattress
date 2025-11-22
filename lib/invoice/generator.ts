import { Order } from '@/types/fulfillment';

export interface InvoiceData {
  order: Order;
  sellerInfo: {
    storeName: string;
    email: string;
    phone: string;
    address: string;
    tradeLicense?: string;
  };
  paymentInfo: {
    method: string;
    status: string;
    paidAt?: string;
  };
  shippingInfo?: {
    method: string;
    charge: number;
    trackingNumber?: string;
    estimatedDelivery?: string;
  };
}

export class InvoiceGenerator {

  // Generate invoice HTML
  generateInvoiceHTML(data: InvoiceData): string {
    const { order, sellerInfo, paymentInfo, shippingInfo } = data;

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice #${order.orderNumber}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
          }

          .invoice {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            overflow: hidden;
          }

          .invoice-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }

          .invoice-header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 300;
          }

          .invoice-header p {
            font-size: 1.1em;
            opacity: 0.9;
          }

          .invoice-body {
            padding: 40px 30px;
          }

          .invoice-meta {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
            flex-wrap: wrap;
            gap: 20px;
          }

          .meta-section {
            flex: 1;
            min-width: 250px;
          }

          .meta-section h3 {
            color: #667eea;
            margin-bottom: 15px;
            font-size: 1.1em;
            border-bottom: 2px solid #667eea;
            padding-bottom: 5px;
          }

          .meta-section p {
            margin-bottom: 8px;
            font-size: 0.95em;
          }

          .meta-section strong {
            color: #333;
            display: inline-block;
            width: 100px;
          }

          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          }

          .items-table th {
            background: #f8f9fa;
            color: #667eea;
            padding: 15px;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid #667eea;
          }

          .items-table td {
            padding: 15px;
            border-bottom: 1px solid #eee;
          }

          .items-table tr:last-child td {
            border-bottom: none;
          }

          .items-table tr:hover {
            background: #f8f9fa;
          }

          .text-center {
            text-align: center;
          }

          .text-right {
            text-align: right;
          }

          .invoice-summary {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 8px;
            margin-top: 30px;
          }

          .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 1.1em;
          }

          .summary-row.total {
            font-size: 1.4em;
            font-weight: bold;
            color: #667eea;
            border-top: 2px solid #667eea;
            padding-top: 15px;
            margin-top: 15px;
          }

          .payment-status {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: 600;
            text-transform: uppercase;
          }

          .payment-status.paid {
            background: #d4edda;
            color: #155724;
          }

          .payment-status.pending {
            background: #fff3cd;
            color: #856404;
          }

          .payment-status.failed {
            background: #f8d7da;
            color: #721c24;
          }

          .footer {
            text-align: center;
            padding: 30px;
            background: #f8f9fa;
            color: #666;
            font-size: 0.9em;
            border-top: 1px solid #eee;
          }

          .barcode {
            text-align: center;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
            font-size: 1.2em;
            letter-spacing: 2px;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            border: 2px dashed #ccc;
          }

          @media print {
            body {
              background: white;
              padding: 0;
            }

            .invoice {
              box-shadow: none;
              border-radius: 0;
            }

            .invoice-header {
              background: #667eea !important;
              -webkit-print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice">
          <!-- Invoice Header -->
          <div class="invoice-header">
            <h1>INVOICE</h1>
            <p>#${order.orderNumber}</p>
          </div>

          <!-- Invoice Body -->
          <div class="invoice-body">
            <!-- Invoice Metadata -->
            <div class="invoice-meta">
              <!-- Seller Information -->
              <div class="meta-section">
                <h3>Seller Information</h3>
                <p><strong>Store:</strong> ${sellerInfo.storeName}</p>
                <p><strong>Email:</strong> ${sellerInfo.email}</p>
                <p><strong>Phone:</strong> ${sellerInfo.phone}</p>
                <p><strong>Address:</strong> ${sellerInfo.address}</p>
                ${sellerInfo.tradeLicense ? `<p><strong>License:</strong> ${sellerInfo.tradeLicense}</p>` : ''}
              </div>

              <!-- Customer Information -->
              <div class="meta-section">
                <h3>Billing Information</h3>
                <p><strong>Name:</strong> ${order.customerName}</p>
                <p><strong>Email:</strong> ${order.customerEmail}</p>
                <p><strong>Phone:</strong> ${order.deliveryAddress.phone}</p>
                <p><strong>Address:</strong> ${order.deliveryAddress.address}</p>
                <p><strong>City:</strong> ${order.deliveryAddress.city}</p>
                <p><strong>State:</strong> ${order.deliveryAddress.state}</p>
              </div>
            </div>

            <!-- Order Barcode -->
            <div class="barcode">
              ${order.orderNumber}
            </div>

            <!-- Items Table -->
            <table class="items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td>${item.productName}</td>
                    <td class="text-center">${item.quantity}</td>
                    <td>৳${item.price.toLocaleString()}</td>
                    <td class="text-right">৳${(item.price * item.quantity).toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <!-- Invoice Summary -->
            <div class="invoice-summary">
              <div class="summary-row">
                <span>Subtotal:</span>
                <span>৳${order.totalAmount.toLocaleString()}</span>
              </div>
              ${shippingInfo ? `
                <div class="summary-row">
                  <span>Shipping Charge:</span>
                  <span>৳${shippingInfo.charge.toLocaleString()}</span>
                </div>
              ` : ''}
              <div class="summary-row total">
                <span>Total Amount:</span>
                <span>৳${(order.totalAmount + (shippingInfo?.charge || 0)).toLocaleString()}</span>
              </div>
            </div>

            <!-- Payment Information -->
            <div class="invoice-meta" style="margin-top: 30px;">
              <div class="meta-section">
                <h3>Payment Information</h3>
                <p><strong>Method:</strong> ${paymentInfo.method}</p>
                <p><strong>Status:</strong>
                  <span class="payment-status ${paymentInfo.status.toLowerCase()}">
                    ${paymentInfo.status}
                  </span>
                </p>
                ${paymentInfo.paidAt ? `<p><strong>Paid At:</strong> ${new Date(paymentInfo.paidAt).toLocaleDateString()}</p>` : ''}
              </div>

              ${shippingInfo ? `
                <div class="meta-section">
                  <h3>Shipping Information</h3>
                  <p><strong>Method:</strong> ${shippingInfo.method}</p>
                  <p><strong>Charge:</strong> ৳${shippingInfo.charge.toLocaleString()}</p>
                  ${shippingInfo.trackingNumber ? `<p><strong>Tracking:</strong> ${shippingInfo.trackingNumber}</p>` : ''}
                  ${shippingInfo.estimatedDelivery ? `<p><strong>Est. Delivery:</strong> ${new Date(shippingInfo.estimatedDelivery).toLocaleDateString()}</p>` : ''}
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p>Thank you for your business! | Generated on ${new Date().toLocaleDateString()}</p>
            <p>InterioWale - Premium Furniture Marketplace</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Convert HTML to PDF using browser's print functionality
  async generatePDF(data: InvoiceData): Promise<void> {
    const html = this.generateInvoiceHTML(data);

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Failed to open print window. Please allow pop-ups and try again.');
    }

    printWindow.document.write(html);
    printWindow.document.close();

    // Wait for the content to load before printing
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  }

  // Download invoice as HTML file
  downloadHTML(data: InvoiceData): void {
    const html = this.generateInvoiceHTML(data);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${data.order.orderNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }
}

export const invoiceGenerator = new InvoiceGenerator();