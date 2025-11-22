import { HeartIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const wishlistType = defineType({
  name: "wishlist",
  title: "User Wishlist",
  type: "document",
  icon: HeartIcon,
  fields: [
    defineField({
      name: "userId",
      title: "User ID",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "products",
      title: "Wishlist Products",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "product",
              title: "Product",
              type: "reference",
              to: [{ type: "product" }],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "addedAt",
              title: "Added At",
              type: "datetime",
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              productName: "product.name",
              productImage: "product.image",
              addedAt: "addedAt",
            },
            prepare(selection) {
              return {
                title: selection.productName,
                subtitle: `Added on ${new Date(selection.addedAt).toLocaleDateString()}`,
                media: selection.productImage,
              };
            },
          },
        }),
      ],
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "updatedAt",
      title: "Updated At",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      userId: "userId",
      productCount: "products.length",
      updatedAt: "updatedAt",
    },
    prepare(selection) {
      return {
        title: `Wishlist - User ${selection.userId}`,
        subtitle: `${selection.productCount || 0} products - Last updated: ${new Date(selection.updatedAt).toLocaleDateString()}`,
        media: HeartIcon,
      };
    },
  },
});