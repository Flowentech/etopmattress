import { NextRequest, NextResponse } from "next/server";
import { backendClient } from "@/sanity/lib/backendClient";
import { auth } from "@clerk/nextjs/server";

async function calculateLevel(parentId: string | null): Promise<number> {
  if (!parentId) return 0;

  const parent = await backendClient.fetch(
    `*[_type == "category" && _id == $parentId][0] { level }`,
    { parentId }
  );

  return parent ? (parent.level || 0) + 1 : 0;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = params.id;
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
    data = await req.json();
  }

  // Calculate level based on parent
  const level = await calculateLevel(data.parent);

  // Prevent creating more than 3 levels
  if (level > 2) {
    return NextResponse.json({ error: "Maximum 3 levels of categories allowed" }, { status: 400 });
  }

  const slug = data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const updateData: any = {
    title: data.title,
    description: data.description || "",
    slug: { _type: "slug", current: slug },
    level,
    order: data.order || 0,
  };

  if (data.parent) {
    updateData.parent = {
      _type: "reference",
      _ref: data.parent,
    };
  } else {
    // Remove parent if it's being set to null
    updateData.parent = null;
  }

  if (data.image) {
    updateData.image = data.image;
  }

  const category = await backendClient.patch(id).set(updateData).commit();

  return NextResponse.json(category);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = params.id;

  // Delete all child categories first (recursive delete)
  const children = await backendClient.fetch(
    `*[_type == "category" && references($parentId)]`,
    { parentId: id }
  );

  for (const child of children) {
    // Recursively delete grandchildren
    const grandchildren = await backendClient.fetch(
      `*[_type == "category" && references($parentId)]`,
      { parentId: child._id }
    );

    for (const grandchild of grandchildren) {
      await backendClient.delete(grandchild._id);
    }

    await backendClient.delete(child._id);
  }

  // Delete the category itself
  await backendClient.delete(id);

  return NextResponse.json({ success: true });
}
