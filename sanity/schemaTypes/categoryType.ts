import { TagIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const categoryType = defineType({
  name: "category",
  title: "Category",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: {
        source: "title",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      type: "text",
    }),
    defineField({
      name: "image",
      title: "Category Image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "parent",
      title: "Parent Category",
      type: "reference",
      to: [{ type: "category" }],
      description: "Select a parent category (leave empty for main category). Maximum 3 levels allowed.",
      options: {
        filter: '_id != $id',
        filterParams: { id: '_id' },
      },
    }),
    defineField({
      name: "level",
      title: "Category Level",
      type: "number",
      hidden: true,
      description: "Auto-calculated: 0 = Main, 1 = Sub, 2 = Sub-Sub",
      initialValue: 0,
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Order in which this category appears (lower numbers first)",
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "description",
      media: "image",
      parent: "parent.title",
      level: "level",
    },
    prepare({ title, subtitle, media, parent, level }) {
      const prefix = level === 1 ? "└─ " : level === 2 ? "   └─ " : "";
      const displayTitle = parent ? `${prefix}${title} (under ${parent})` : title;
      return {
        title: displayTitle,
        subtitle: subtitle,
        media: media,
      };
    },
  },
});
