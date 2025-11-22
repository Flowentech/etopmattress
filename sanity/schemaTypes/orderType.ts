import { BasketIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const orderType = defineType({
  name: "order",
  title: "Order",
  type: "document",
  icon: BasketIcon,
  fields: [
    defineField({
      name: "orderNumber",
      title: "Order Number",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "paymentMethod",
      title: "Payment Method",
      type: "string",
      options: {
        list: [
          { title: "Stripe", value: "stripe" },
          { title: "Cash on Delivery", value: "cod" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "stripeCheckoutSessionId",
      title: "Stripe Checkout Session ID",
      type: "string",
      hidden: ({ document }) => document?.paymentMethod === "cod",
    }),
    defineField({
      name: "stripeCustomerId",
      title: "Stripe Customer ID",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "clerkUserId",
      title: "Store User ID",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "customerName",
      title: "Customer Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "email",
      title: "Customer Email",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "stripePaymentIntentId",
      title: "Stripe Payment Intent ID",
      type: "string",
      validation: (Rule) => Rule.custom((value, context) => {
        const paymentMethod = context.document?.paymentMethod;
        if (paymentMethod === "stripe" && !value) {
          return "Payment Intent ID is required for Stripe payments";
        }
        return true;
      }),
      hidden: ({ document }) => document?.paymentMethod === "cod",
    }),
    defineField({
      name: "products",
      title: "Products",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "product",
              title: "Product Bought",
              type: "reference",
              to: [{ type: "product" }],
            }),
            defineField({
              name: "quantity",
              title: "Quantity Purchased",
              type: "number",
            }),
          ],
          preview: {
            select: {
              product: "product.name",
              quantity: "quantity",
              image: "product.image",
              price: "product.price",
              currency: "product.currency",
            },
            prepare(select) {
              return {
                title: `${select.product} x ${select.quantity}`,
                subtitle: `${select.price * select.quantity}`,
                media: select.image,
              };
            },
          },
        }),
      ],
    }),
    defineField({
      name: "totalPrice",
      title: "Total Price",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "amountDiscount",
      title: "Amount Discount",
      type: "number",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "status",
      title: "Order Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Confirmed", value: "confirmed" },
          { title: "Paid", value: "paid" },
          { title: "Processing", value: "processing" },
          { title: "Shipped", value: "shipped" },
          { title: "Out for Delivery", value: "out_for_delivery" },
          { title: "Delivered", value: "delivered" },
          { title: "COD Collected", value: "cod_collected" },
          { title: "Cancelled", value: "cancelled" },
        ],
      },
    }),
    defineField({
      name: "orderDate",
      title: "Order Date",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "trackingNumber",
      title: "Tracking Number",
      type: "string",
      description: "Delivery tracking number",
    }),
    defineField({
      name: "courierService",
      title: "Courier Service",
      type: "string",
      options: {
        list: [
          { title: "Steadfast", value: "steadfast" },
          { title: "Pathao", value: "pathao" },
          { title: "RedX", value: "redx" },
          { title: "Other", value: "other" },
        ],
      },
    }),
    defineField({
      name: "estimatedDelivery",
      title: "Estimated Delivery Date",
      type: "datetime",
      description: "Expected delivery date",
    }),
    defineField({
      name: "deliveryAddress",
      title: "Delivery Address",
      type: "object",
      fields: [
        defineField({
          name: "fullName",
          title: "Full Name",
          type: "string",
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "phone",
          title: "Phone Number",
          type: "string",
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "address",
          title: "Street Address",
          type: "text",
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "city",
          title: "City",
          type: "string",
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "state",
          title: "State/Division",
          type: "string",
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "zipCode",
          title: "ZIP/Postal Code",
          type: "string",
        }),
        defineField({
          name: "country",
          title: "Country",
          type: "string",
          initialValue: "Bangladesh",
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: "orderUpdates",
      title: "Order Updates",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "status",
              title: "Status",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "message",
              title: "Update Message",
              type: "text",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "timestamp",
              title: "Timestamp",
              type: "datetime",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "location",
              title: "Location",
              type: "string",
              description: "Current location for tracking",
            }),
          ],
          preview: {
            select: {
              status: "status",
              message: "message",
              timestamp: "timestamp",
            },
            prepare(selection) {
              return {
                title: selection.status,
                subtitle: `${selection.message} - ${new Date(selection.timestamp).toLocaleDateString()}`,
              };
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      name: "customerName",
      amount: "totalPrice",
      currency: "currency",
      orderId: "orderNumber",
      email: "email",
    },
    prepare(select) {
      const orderIdSnippet = `${select.orderId.slice(0, 5)}...${select.orderId.slice(-5)}`;
      return {
        title: `${select.name} (${orderIdSnippet})`,
        subtitle: `${select.amount} ${select.currency}, ${select.email}`,
        media: BasketIcon,
      };
    },
  },
});
