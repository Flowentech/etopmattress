import { NextRequest, NextResponse } from "next/server";
import { backendClient } from "@/sanity/lib/backendClient";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const categories = await backendClient.fetch(`*[_type == "category"] | order(order asc, title asc) {
    _id,
    title,
    slug,
    description,
    level,
    order,
    "parent": parent-> {
      _id,
      title
    },
    "image": image {
      ...,
      "url": asset->url
    }
  }`);
  return NextResponse.json(categories);
}

async function calculateLevel(parentId: string | null): Promise<number> {
  if (!parentId) return 0;

  const parent = await backendClient.fetch(
    `*[_type == "category" && _id == $parentId][0] { level }`,
    { parentId }
  );

  return parent ? (parent.level || 0) + 1 : 0;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contentType = req.headers.get("content-type");
  let data: any = {};

  if (contentType?.includes("multipart/form-data")) {
    const formData = await req.formData();
    data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string || "",
      parent: formData.get("parent") as string || null,
      order: parseInt(formData.get("order") as string) || 0,
    };

    const imageFile = formData.get("image") as File;
    if (imageFile && imageFile.size > 0) {
      // Upload image to Sanity
      const imageAsset = await backendClient.assets.upload("image", imageFile);
      data.image = {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: imageAsset._id,
        },
      };
    }
  } else {
    // Handle JSON data for backward compatibility
    data = await req.json();
  }

  // Calculate level based on parent
  const level = await calculateLevel(data.parent);

  // Prevent creating more than 3 levels
  if (level > 2) {
    return NextResponse.json({ error: "Maximum 3 levels of categories allowed" }, { status: 400 });
  }

  const slug = data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const categoryData: any = {
    _type: "category",
    title: data.title,
    description: data.description || "",
    slug: { _type: "slug", current: slug },
    level,
    order: data.order || 0,
  };

  if (data.parent) {
    categoryData.parent = {
      _type: "reference",
      _ref: data.parent,
    };
  }

  if (data.image) {
    categoryData.image = data.image;
  }

  const category = await backendClient.create(categoryData);

  return NextResponse.json(category);
}
