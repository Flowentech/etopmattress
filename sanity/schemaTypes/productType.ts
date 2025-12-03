import { TrolleyIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const productType = defineType({
  name: "product",
  title: "Products",
  type: "document",
  icon: TrolleyIcon,
  fields: [
    defineField({
      name: "name",
      title: "Product Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "image",
      title: "Product Image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "string",
    }),
    defineField({
      name: "price",
      title: "Price",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "discount",
      title: "Discount",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      of: [{ type: "reference", to: { type: "category" } }],
    }),
    defineField({
      name: "navigationcategory",
      title: "Section Categories",
      type: "array",
      of: [{ type: "reference", to: { type: "navigationcategory" } }],
    }),
    defineField({
      name: "stock",
      title: "Stock",
      type: "number",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "status",
      title: "Product Status",
      type: "string",
      options: {
        list: [
          { title: "New", value: "new" },
          { title: "Hot", value: "hot" },
          { title: "Sale", value: "sale" },
        ],
      },
    }),
    defineField({
      name: "hasVariants",
      title: "Enable Size & Height Variants",
      type: "boolean",
      description: "Check this if product price depends on size and height",
      initialValue: false,
    }),
    defineField({
      name: "priceVariants",
      title: "Price Variants",
      type: "array",
      description: "Add different prices for size and height combinations",
      hidden: ({ parent }) => !parent?.hasVariants,
      of: [
        {
          type: "object",
          fields: [
            {
              name: "size",
              title: "Size",
              type: "reference",
              to: [{ type: "size" }],
              validation: (Rule) => Rule.required(),
            },
            {
              name: "height",
              title: "Height",
              type: "reference",
              to: [{ type: "height" }],
              validation: (Rule) => Rule.required(),
            },
            {
              name: "price",
              title: "Price",
              type: "number",
              validation: (Rule) => Rule.required().min(0),
            },
            {
              name: "stock",
              title: "Stock",
              type: "number",
              validation: (Rule) => Rule.min(0),
              initialValue: 0,
            },
          ],
          preview: {
            select: {
              sizeName: "size.name",
              heightName: "height.name",
              price: "price",
              stock: "stock",
            },
            prepare({ sizeName, heightName, price, stock }) {
              return {
                title: `${sizeName} - ${heightName}`,
                subtitle: `$${price} (Stock: ${stock})`,
              };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "name",
      media: "image",
      subtitle: "price",
    },
    prepare(selection) {
      return {
        title: selection.title,
        subtitle: `$${selection.subtitle}`,
        media: selection.media,
      };
    },
  },
});
