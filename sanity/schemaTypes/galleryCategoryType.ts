import { defineField, defineType } from "sanity";
import { TagIcon } from "@sanity/icons";

export const galleryCategoryType = defineType({
  name: "galleryCategory",
  title: "Gallery Category",
  type: "document",
  icon: TagIcon,
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
      name: "description",
      title: "Description",
      type: "text",
    }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      description: "Emoji or icon for the category"
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Order in which the category appears",
      initialValue: 0
    }),
  ],
  preview: {
    select: {
      title: "title",
      icon: "icon",
    },
    prepare(selection) {
      const { title, icon } = selection;
      return {
        title,
        subtitle: icon || "Gallery Category",
      };
    },
  },
});
