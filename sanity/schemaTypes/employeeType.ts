import { UsersIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const employeeType = defineType({
  name: "employee",
  title: "Employee",
  type: "document",
  icon: UsersIcon,
  fields: [
    defineField({
      name: "clerkId",
      title: "Clerk User ID",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "firstName",
      title: "First Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "lastName",
      title: "Last Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "role",
      title: "Employee Role",
      type: "string",
      options: {
        list: [
          { title: "Supreme Admin", value: "supreme_admin" },
          { title: "Platform Admin", value: "platform_admin" },
          { title: "Store Moderator", value: "store_moderator" },
          { title: "Customer Support", value: "customer_support" },
          { title: "Content Moderator", value: "content_moderator" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "customPermissions",
      title: "Custom Permissions",
      type: "array",
      of: [{ type: "string" }],
      description: "Additional permissions beyond role-based permissions",
    }),
    defineField({
      name: "department",
      title: "Department",
      type: "string",
      options: {
        list: [
          { title: "Management", value: "management" },
          { title: "Operations", value: "operations" },
          { title: "Customer Support", value: "customer_support" },
          { title: "Content Moderation", value: "content_moderation" },
          { title: "Technical", value: "technical" },
        ],
      },
    }),
    defineField({
      name: "isActive",
      title: "Active Status",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "isOnline",
      title: "Online Status",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "lastLoginAt",
      title: "Last Login",
      type: "datetime",
    }),
    defineField({
      name: "employmentDetails",
      title: "Employment Details",
      type: "object",
      fields: [
        defineField({
          name: "employeeId",
          title: "Employee ID",
          type: "string",
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "hireDate",
          title: "Hire Date",
          type: "date",
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "department",
          title: "Department",
          type: "string",
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "manager",
          title: "Manager",
          type: "reference",
          to: [{ type: "employee" }],
        }),
        defineField({
          name: "salary",
          title: "Salary",
          type: "number",
        }),
        defineField({
          name: "workSchedule",
          title: "Work Schedule",
          type: "object",
          fields: [
            defineField({
              name: "workDays",
              title: "Work Days",
              type: "array",
              of: [{ type: "string" }],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "workHours",
              title: "Work Hours",
              type: "object",
              fields: [
                defineField({
                  name: "start",
                  title: "Start Time",
                  type: "string",
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: "end",
                  title: "End Time",
                  type: "string",
                  validation: (Rule) => Rule.required(),
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "permissions",
      title: "Permission Overrides",
      type: "object",
      fields: [
        defineField({
          name: "granted",
          title: "Additional Permissions",
          type: "array",
          of: [{ type: "string" }],
        }),
        defineField({
          name: "revoked",
          title: "Revoked Permissions",
          type: "array",
          of: [{ type: "string" }],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      firstName: "firstName",
      lastName: "lastName",
      role: "role",
      email: "email",
      isActive: "isActive",
    },
    prepare(selection) {
      return {
        title: `${selection.firstName} ${selection.lastName}`,
        subtitle: `${selection.role} - ${selection.email} ${selection.isActive ? '✅' : '❌'}`,
        media: UsersIcon,
      };
    },
  },
});

export const employeeActivityType = defineType({
  name: "employeeActivity",
  title: "Employee Activity",
  type: "document",
  fields: [
    defineField({
      name: "employeeId",
      title: "Employee ID",
      type: "reference",
      to: [{ type: "employee" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "action",
      title: "Action",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "resource",
      title: "Resource Type",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "resourceId",
      title: "Resource ID",
      type: "string",
    }),
    defineField({
      name: "details",
      title: "Details",
      type: "object",
      fields: [
        defineField({
          name: "previousValue",
          title: "Previous Value",
          type: "string",
        }),
        defineField({
          name: "newValue",
          title: "New Value",
          type: "string",
        }),
        defineField({
          name: "reason",
          title: "Reason",
          type: "text",
        }),
      ],
    }),
    defineField({
      name: "ipAddress",
      title: "IP Address",
      type: "string",
    }),
    defineField({
      name: "userAgent",
      title: "User Agent",
      type: "text",
    }),
    defineField({
      name: "timestamp",
      title: "Timestamp",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Stores", value: "stores" },
          { title: "Users", value: "users" },
          { title: "Orders", value: "orders" },
          { title: "Content", value: "content" },
          { title: "Analytics", value: "analytics" },
          { title: "Settings", value: "settings" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
  orderings: [
    {
      title: "Timestamp (Newest First)",
      name: "timestampDesc",
      by: [{ field: "timestamp", direction: "desc" }],
    },
  ],
});

export const performanceReviewType = defineType({
  name: "performanceReview",
  title: "Performance Review",
  type: "document",
  fields: [
    defineField({
      name: "employeeId",
      title: "Employee",
      type: "reference",
      to: [{ type: "employee" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "reviewerId",
      title: "Reviewer",
      type: "reference",
      to: [{ type: "employee" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "period",
      title: "Review Period",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "overallRating",
      title: "Overall Rating",
      type: "number",
      validation: (Rule) => Rule.required().min(1).max(5),
    }),
    defineField({
      name: "categories",
      title: "Category Ratings",
      type: "object",
      fields: [
        defineField({
          name: "productivity",
          title: "Productivity",
          type: "number",
          validation: (Rule) => Rule.min(1).max(5),
        }),
        defineField({
          name: "quality",
          title: "Quality of Work",
          type: "number",
          validation: (Rule) => Rule.min(1).max(5),
        }),
        defineField({
          name: "teamwork",
          title: "Teamwork",
          type: "number",
          validation: (Rule) => Rule.min(1).max(5),
        }),
        defineField({
          name: "communication",
          title: "Communication",
          type: "number",
          validation: (Rule) => Rule.min(1).max(5),
        }),
        defineField({
          name: "problemSolving",
          title: "Problem Solving",
          type: "number",
          validation: (Rule) => Rule.min(1).max(5),
        }),
      ],
    }),
    defineField({
      name: "strengths",
      title: "Strengths",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "areasForImprovement",
      title: "Areas for Improvement",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "goals",
      title: "Goals",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "feedback",
      title: "Feedback",
      type: "text",
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Draft", value: "draft" },
          { title: "Submitted", value: "submitted" },
          { title: "Reviewed", value: "reviewed" },
        ],
      },
      initialValue: "draft",
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "reviewedAt",
      title: "Reviewed At",
      type: "datetime",
    }),
  ],
});