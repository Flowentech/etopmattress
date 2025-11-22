import { defineField, defineType } from "sanity";
import { ImageIcon } from "@sanity/icons";

export const galleryType = defineType({
  name: "gallery",
  title: "Gallery",
  type: "document",
  icon: ImageIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Living Room", value: "Living Room" },
          { title: "Office", value: "Office" },
          { title: "Bedroom", value: "Bedroom" },
          { title: "Kitchen", value: "Kitchen" },
          { title: "Outdoor", value: "Outdoor" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Main Image",
      type: "image",
      options: {
        hotspot: true,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "detailedDescription",
      title: "Detailed Description",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "gallery",
      title: "Additional Images",
      type: "array",
      of: [{ type: "image" }],
    }),
    defineField({
      name: "features",
      title: "Key Features",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "isFeatured",
      title: "Featured Project",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "image",
      category: "category",
    },
    prepare(selection) {
      const { title, media, category } = selection;
      return {
        title,
        subtitle: category,
        media,
      };
    },
  },
});