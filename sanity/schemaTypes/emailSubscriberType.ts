import { EnvelopeIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const emailSubscriberType = defineType({
  name: "emailSubscriber",
  title: "Email Subscriber",
  type: "document",
  icon: EnvelopeIcon,
  fields: [
    defineField({
      name: "email",
      title: "Email Address",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "source",
      title: "Subscription Source",
      type: "string",
      options: {
        list: [
          { title: "Newsletter Signup", value: "newsletter" },
          { title: "Guest Checkout", value: "guest_checkout" },
          { title: "Guest Wishlist Sync", value: "guest_wishlist_sync" },
          { title: "Account Registration", value: "account_registration" },
          { title: "Contact Form", value: "contact_form" },
          { title: "Social Media", value: "social_media" },
          { title: "Manual Import", value: "manual_import" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "status",
      title: "Subscription Status",
      type: "string",
      options: {
        list: [
          { title: "Active", value: "active" },
          { title: "Unsubscribed", value: "unsubscribed" },
          { title: "Bounced", value: "bounced" },
          { title: "Pending Confirmation", value: "pending" },
        ],
      },
      initialValue: "active",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "customerName",
      title: "Customer Name",
      type: "string",
      description: "Name if available",
    }),
    defineField({
      name: "userId",
      title: "User ID",
      type: "string",
      description: "Clerk User ID if user registers later",
    }),
    defineField({
      name: "orderNumber",
      title: "First Order Number",
      type: "string",
      description: "Order number if subscribed during checkout",
    }),
    defineField({
      name: "subscribedAt",
      title: "Subscribed At",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "unsubscribedAt",
      title: "Unsubscribed At",
      type: "datetime",
      hidden: ({ document }) => document?.status !== "unsubscribed",
    }),
    defineField({
      name: "lastEmailSent",
      title: "Last Email Sent",
      type: "datetime",
      description: "Track when we last sent an email to prevent spam",
    }),
    defineField({
      name: "emailsSent",
      title: "Total Emails Sent",
      type: "number",
      initialValue: 0,
      description: "Track total emails sent to this subscriber",
    }),
    defineField({
      name: "tags",
      title: "Subscriber Tags",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "VIP Customer", value: "vip" },
          { title: "High Value", value: "high_value" },
          { title: "Frequent Buyer", value: "frequent_buyer" },
          { title: "Interior Designer", value: "designer" },
          { title: "Plant Enthusiast", value: "plant_lover" },
          { title: "Dhaka Customer", value: "dhaka" },
          { title: "Chittagong Customer", value: "chittagong" },
          { title: "Corporate Client", value: "corporate" },
        ],
      },
      description: "Marketing segments and customer categories",
    }),
    defineField({
      name: "metadata",
      title: "Additional Data",
      type: "object",
      fields: [
        defineField({
          name: "firstOrderValue",
          title: "First Order Value",
          type: "number",
        }),
        defineField({
          name: "totalOrderValue",
          title: "Total Order Value",
          type: "number",
        }),
        defineField({
          name: "orderCount",
          title: "Total Orders",
          type: "number",
          initialValue: 0,
        }),
        defineField({
          name: "city",
          title: "City",
          type: "string",
        }),
        defineField({
          name: "state",
          title: "State/Division",
          type: "string",
        }),
        defineField({
          name: "phone",
          title: "Phone Number",
          type: "string",
        }),
        defineField({
          name: "preferredLanguage",
          title: "Preferred Language",
          type: "string",
          options: {
            list: [
              { title: "English", value: "en" },
              { title: "Bengali", value: "bn" },
            ],
          },
          initialValue: "en",
        }),
      ],
    }),
    defineField({
      name: "campaigns",
      title: "Email Campaigns",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "campaignId",
              title: "Campaign ID",
              type: "string",
            }),
            defineField({
              name: "campaignName",
              title: "Campaign Name",
              type: "string",
            }),
            defineField({
              name: "sentAt",
              title: "Sent At",
              type: "datetime",
            }),
            defineField({
              name: "opened",
              title: "Opened",
              type: "boolean",
              initialValue: false,
            }),
            defineField({
              name: "clicked",
              title: "Clicked",
              type: "boolean",
              initialValue: false,
            }),
          ],
        },
      ],
      description: "Track email campaign engagement",
    }),
  ],
  preview: {
    select: {
      email: "email",
      status: "status",
      source: "source",
      subscribedAt: "subscribedAt",
      customerName: "customerName",
    },
    prepare(selection) {
      const statusColors = {
        active: "🟢",
        unsubscribed: "🔴",
        bounced: "🟡",
        pending: "🟠",
      };
      
      return {
        title: selection.customerName || selection.email,
        subtitle: `${statusColors[selection.status as keyof typeof statusColors]} ${selection.source} - ${new Date(selection.subscribedAt).toLocaleDateString()}`,
        media: EnvelopeIcon,
      };
    },
  },
});