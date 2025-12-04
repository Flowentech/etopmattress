import { ExpandIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const sizeType = defineType({
  name: "size",
  title: "Sizes",
  type: "document",
  icon: ExpandIcon,
  fields: [
    defineField({
      name: "name",
      title: "Size Name",
      type: "string",
      description: "e.g., 5 feet x 7 feet, 6 feet x 8 feet",
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
      name: "width",
      title: "Width (in feet)",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "length",
      title: "Length (in feet)",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "displayOrder",
      title: "Display Order",
      type: "number",
      description: "Order in which this size appears in dropdowns",
      validation: (Rule) => Rule.min(0),
    }),
  ],
  preview: {
    select: {
      title: "name",
      width: "width",
      length: "length",
    },
    prepare(selection) {
      return {
        title: selection.title,
        subtitle: `${selection.width}' x ${selection.length}'`,
      };
    },
  },
});
