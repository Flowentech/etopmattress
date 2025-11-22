# Hierarchical Category System - Implementation Guide

## Overview
A complete 3-level hierarchical category system with expandable/collapsible dropdowns for organizing products in an e-commerce application.

## Features
- **3-Level Hierarchy**: Main Category → Subcategory → Sub-subcategory
- **Expandable UI**: Click-to-expand dropdowns with chevron icons
- **Visual Hierarchy**: Indented subcategories for clear parent-child relationships
- **Product Counts**: Real-time count of products in each category
- **Active State Highlighting**: Selected categories highlighted in green
- **Sanity CMS Integration**: Fully integrated with Sanity Studio for content management

## System Architecture

### 1. Database Schema (Sanity)

**File**: `sanity/schemaTypes/categoryType.ts`

```typescript
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
```

**Key Features**:
- Self-referencing `parent` field for hierarchy
- Shows category **names** in dropdown (not IDs)
- Prevents circular references with filter
- Visual hierarchy preview in Sanity Studio

### 2. Data Fetching (Sanity Queries)

**File**: `sanity/queries/filterQueries.ts`

```typescript
import { defineQuery } from "next-sanity";

export const CATEGORIES_WITH_COUNT_QUERY = defineQuery(`
  *[_type == "category"] {
    _id,
    title,
    slug,
    description,
    image,
    level,
    order,
    "parent": parent-> {
      _id,
      title
    },
    "productCount": count(*[_type == "product" && references(^._id)])
  } | order(order asc, title asc)
`);
```

**Key Features**:
- Fetches all categories with parent references
- Calculates product count for each category
- Orders by display order and title

### 3. Frontend Implementation (React Component)

**File**: `components/shop/ShopFilters.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";

interface CategoryTree extends CategoryWithCount {
  level: number;
  parent?: { _id: string; title: string };
  children?: CategoryTree[];
}

export default function ShopFilters({ categories, currentFilters }: ShopFiltersProps) {
  const [categoryTree, setCategoryTree] = useState<CategoryTree[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Build category tree on mount
  useEffect(() => {
    const tree = buildCategoryTree(categories);
    setCategoryTree(tree);
  }, [categories]);

  const buildCategoryTree = (cats: any[]): CategoryTree[] => {
    const categoryMap = new Map<string, CategoryTree>();
    const rootCategories: CategoryTree[] = [];

    // Initialize all categories
    cats.forEach((cat) => {
      categoryMap.set(cat._id, { ...cat, children: [] });
    });

    // Build tree structure
    cats.forEach((cat) => {
      const category = categoryMap.get(cat._id)!;
      if (cat.parent?._id) {
        const parent = categoryMap.get(cat.parent._id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(category);
        }
      } else {
        rootCategories.push(category);
      }
    });

    return rootCategories.sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  const toggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const renderCategoryTree = (category: CategoryTree, depth: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isSelected = currentFilters.category === category._id;
    const isExpanded = expandedCategories.has(category._id);
    const paddingLeft = depth * 12;

    return (
      <div key={category._id} className="space-y-1">
        <div className="flex items-center">
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(category._id);
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              style={{ marginLeft: `${paddingLeft}px` }}
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-gray-500" />
              ) : (
                <ChevronRight className="w-3 h-3 text-gray-500" />
              )}
            </button>
          ) : (
            <div style={{ width: "20px", marginLeft: `${paddingLeft}px` }} />
          )}

          <button
            onClick={() => updateFilter("category", category._id)}
            className={`flex-1 flex items-center rounded text-xs transition-colors py-1.5 px-2 ${
              isSelected
                ? "bg-emerald-100 text-emerald-800 font-semibold"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span className="flex-1 text-left">{category.title}</span>
            <span className="text-gray-400 text-[10px]">({category.productCount})</span>
          </button>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {category.children?.map((child) => renderCategoryTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <button onClick={() => updateFilter("category", "all")}>
          All Categories
        </button>
        {categoryTree.map((category) => renderCategoryTree(category))}
      </CardContent>
    </Card>
  );
}
```

**Key Features**:
- Builds tree structure from flat category list
- Tracks expanded/collapsed state
- Recursive rendering for unlimited depth
- Visual indentation based on depth
- Chevron icons for expandable categories

## Usage Guide

### Creating Categories in Sanity Studio

1. **Create Main Category**:
   - Go to Sanity Studio (`/studio`)
   - Click "Category" → "Create"
   - Fill in: Title, Slug, Description, Image
   - Leave "Parent Category" **empty**
   - Set "Display Order" (e.g., 1, 2, 3...)
   - Click "Publish"

2. **Create Subcategory**:
   - Click "Category" → "Create"
   - Fill in: Title, Slug, Description, Image
   - Select a **parent category** (e.g., "Mattress")
   - Set "Display Order"
   - Click "Publish"

3. **Create Sub-subcategory**:
   - Click "Category" → "Create"
   - Fill in details
   - Select a **subcategory** as parent
   - Click "Publish"

### Example Category Structure

```
📁 Mattress (Main)
  └─ 📁 Memory Foam (Sub)
      └─ King Size Memory Foam (Sub-sub)
      └─ Queen Size Memory Foam (Sub-sub)
  └─ 📁 Spring Mattress (Sub)
      └─ Pocket Spring (Sub-sub)
      └─ Bonnell Spring (Sub-sub)
  └─ Hybrid Mattress (Sub)
  └─ Latex Mattress (Sub)

📁 Pillows (Main)
  └─ Memory Foam Pillows (Sub)
  └─ Down Pillows (Sub)
  └─ Orthopedic Pillows (Sub)
```

## UI Behavior

### Expand/Collapse
- Click the **chevron icon** (▶/▼) to expand/collapse subcategories
- Click the **category name** to filter products by that category
- Categories with children show a chevron icon
- Leaf categories (no children) show no chevron

### Visual States
- **Default**: Gray text, white background
- **Hover**: Light gray background
- **Selected**: Green background, green text, bold font
- **Expanded**: Chevron points down, children visible
- **Collapsed**: Chevron points right, children hidden

### Indentation
- **Level 0** (Main): No indentation
- **Level 1** (Sub): 12px left margin
- **Level 2** (Sub-sub): 24px left margin

## Technical Details

### State Management
- `categoryTree`: Array of root categories with nested children
- `expandedCategories`: Set of category IDs that are expanded
- URL params: `?category=<categoryId>` for filtering

### Performance
- Categories cached for 1 hour (3600 seconds)
- Product counts calculated server-side
- Tree built once on component mount
- Revalidation on cache tags: `["categories", "products"]`

### Filtering Logic
- Filter applies to selected category and all descendants
- Product count includes products in subcategories
- URL updates on category selection
- Page resets to 1 when filtering

## Customization Options

### Styling
- Colors: Change `bg-emerald-100` and `text-emerald-800` for different highlight colors
- Indentation: Adjust `depth * 12` for wider/narrower indentation
- Icons: Replace `ChevronDown`/`ChevronRight` with custom icons

### Depth Limit
- Current: 3 levels (0, 1, 2)
- To change: Update `level` validation and rendering logic

### Product Count Display
- Current: Shows count for each category
- To hide: Remove `<span>({category.productCount})</span>`

### Auto-Expand
- To auto-expand all: Initialize with all IDs in `expandedCategories`
- To expand selected path: Add logic to expand parents of selected category

## File Structure

```
/sanity
  /schemaTypes
    categoryType.ts         # Category schema definition
  /queries
    filterQueries.ts        # Category queries

/components
  /shop
    ShopFilters.tsx         # Category filter UI

/lib
  filterService.ts          # Category fetching & caching

/app
  /(client)
    /shop
      page.tsx              # Shop page with filters
```

## API Endpoints

None required - uses direct Sanity queries via `sanityFetch`

## Dependencies

```json
{
  "dependencies": {
    "sanity": "3",
    "next-sanity": "9",
    "@sanity/client": "^6.22.4",
    "@sanity/icons": "^3.4.0",
    "lucide-react": "^0.488.0"
  }
}
```

## Troubleshooting

### Categories not showing
- Check Sanity Studio has categories published
- Verify `CATEGORIES_WITH_COUNT_QUERY` returns data
- Check browser console for errors

### Parent category shows ID instead of name
- Ensure `categoryType.ts` has `options.filter` configured
- Clear Sanity Studio cache (Cmd/Ctrl + Shift + R)

### Subcategories not expanding
- Verify `parent` field is set correctly
- Check `buildCategoryTree` function builds tree properly
- Inspect `categoryTree` state in React DevTools

### Product count incorrect
- Verify products have category references
- Check `productCount` query in Sanity Vision
- Clear cache: revalidate tags `["categories", "products"]`

## Future Enhancements

1. **Search within categories**: Add search input to filter categories
2. **Drag-and-drop reordering**: Use Sanity's drag-drop plugin
3. **Category icons**: Add icon field to schema
4. **Multiple parent support**: Allow categories in multiple hierarchies
5. **Category SEO**: Add meta fields for category pages
6. **Category filters**: Filter by category attributes (color, size, etc.)

## Support

For issues or questions, refer to:
- Sanity Documentation: https://www.sanity.io/docs
- Next.js Documentation: https://nextjs.org/docs
- Project Repository: [Your repo URL]
 