import { StarIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const reviewType = defineType({
  name: "review",
  title: "Product Review",
  type: "document",
  icon: StarIcon,
  fields: [
    defineField({
      name: "product",
      title: "Product",
      type: "reference",
      to: [{ type: "product" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "user",
      title: "User ID",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "userName",
      title: "User Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "userEmail",
      title: "User Email",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "rating",
      title: "Rating",
      type: "number",
      validation: (Rule) => Rule.required().min(1).max(5),
      options: {
        list: [
          { title: "1 Star", value: 1 },
          { title: "2 Stars", value: 2 },
          { title: "3 Stars", value: 3 },
          { title: "4 Stars", value: 4 },
          { title: "5 Stars", value: 5 },
        ],
      },
    }),
    defineField({
      name: "title",
      title: "Review Title",
      type: "string",
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: "comment",
      title: "Review Comment",
      type: "text",
      validation: (Rule) => Rule.required().min(10).max(1000),
    }),
    defineField({
      name: "images",
      title: "Review Images",
      type: "array",
      of: [
        defineArrayMember({
          type: "image",
          options: {
            hotspot: true,
          },
          fields: [
            defineField({
              name: "alt",
              title: "Alt Text",
              type: "string",
            }),
          ],
        }),
      ],
      options: {
        layout: "grid",
      },
      validation: (Rule) => Rule.max(5),
    }),
    defineField({
      name: "verified",
      title: "Verified Purchase",
      type: "boolean",
      initialValue: false,
      description: "Automatically set to true if user purchased this product",
    }),
    defineField({
      name: "helpful",
      title: "Helpful Count",
      type: "number",
      initialValue: 0,
      description: "Number of users who found this review helpful",
    }),
    defineField({
      name: "status",
      title: "Review Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Approved", value: "approved" },
          { title: "Rejected", value: "rejected" },
        ],
      },
      initialValue: "pending",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "title",
      rating: "rating",
      userName: "userName",
      productName: "product.name",
      media: "images.0",
    },
    prepare(selection) {
      const stars = "★".repeat(selection.rating) + "☆".repeat(5 - selection.rating);
      return {
        title: `${selection.title} (${stars})`,
        subtitle: `by ${selection.userName} for ${selection.productName}`,
        media: selection.media,
      };
    },
  },
});