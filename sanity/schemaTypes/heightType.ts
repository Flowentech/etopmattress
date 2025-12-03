import { StackIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const heightType = defineType({
  name: "height",
  title: "Heights",
  type: "document",
  icon: StackIcon,
  fields: [
    defineField({
      name: "name",
      title: "Height Name",
      type: "string",
      description: "e.g., 4 inch, 5 inch, 6 inch",
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
      name: "value",
      title: "Height Value (in inches)",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "displayOrder",
      title: "Display Order",
      type: "number",
      description: "Order in which this height appears in dropdowns",
      validation: (Rule) => Rule.min(0),
    }),
  ],
  preview: {
    select: {
      title: "name",
      value: "value",
    },
    prepare(selection) {
      return {
        title: selection.title,
        subtitle: `${selection.value} inches`,
      };
    },
  },
});
