import { TagIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const salesType = defineType({
  name: "sale",
  title: "Sale",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
      name: "title",
      title: "Sale Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Sale Description",
      type: "text",
    }),
    defineField({
      name: "couponCode",
      title: "Coupon Code",
      type: "string",
      validation: (Rule) => Rule.required().uppercase(),
      description: "Unique coupon code (will be converted to uppercase)",
    }),
    defineField({
      name: "discountType",
      title: "Discount Type",
      type: "string",
      options: {
        list: [
          { title: "Percentage", value: "percentage" },
          { title: "Fixed Amount", value: "fixed" },
        ],
      },
      initialValue: "percentage",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "discountAmount",
      title: "Discount Amount",
      type: "number",
      description: "Percentage (e.g., 10 for 10%) or Fixed amount in BDT",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "minOrderValue",
      title: "Minimum Order Value",
      type: "number",
      description: "Minimum cart value required to apply this coupon (in BDT)",
      initialValue: 0,
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "maxDiscount",
      title: "Maximum Discount",
      type: "number",
      description: "Maximum discount amount (only for percentage type, in BDT)",
      hidden: ({ document }) => document?.discountType === "fixed",
    }),
    defineField({
      name: "maxUsageCount",
      title: "Maximum Total Uses",
      type: "number",
      description: "Total number of times this coupon can be used (0 = unlimited)",
      initialValue: 0,
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "maxUsagePerUser",
      title: "Maximum Uses Per User",
      type: "number",
      description: "Maximum times a single user can use this coupon (0 = unlimited)",
      initialValue: 1,
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "currentUsageCount",
      title: "Current Usage Count",
      type: "number",
      description: "Number of times this coupon has been used",
      initialValue: 0,
      readOnly: true,
    }),
    defineField({
      name: "validFrom",
      title: "Valid From",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "validUntil",
      title: "Valid Until",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "isActive",
      title: "Is Active",
      type: "boolean",
      description: "Toggle to activate/deactivate the sale",
      initialValue: true,
    }),
    defineField({
      name: "badge",
      title: "Discount Badge",
      type: "string",
      description: "Optional badge text for display",
    }),
    defineField({
      name: "image",
      title: "Promotional Image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
  ],
  preview: {
    select: {
      title: "title",
      discountAmount: "discountAmount",
      discountType: "discountType",
      couponCode: "couponCode",
      isActive: "isActive",
      currentUsageCount: "currentUsageCount",
    },
    prepare(select) {
      const { title, discountAmount, discountType, couponCode, isActive, currentUsageCount } = select;
      const status = isActive ? "Active" : "Inactive";
      const discount = discountType === "percentage" ? `${discountAmount}%` : `BDT ${discountAmount}`;
      return {
        title,
        subtitle: `${discount} off - Code: ${couponCode} - Used: ${currentUsageCount || 0}x - ${status}`,
      };
    },
  },
});
