import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/lib/backendClient";

// GET - Fetch all sizes
export async function GET() {
  try {
    const sizes = await client.fetch(
      `*[_type == "size"] | order(displayOrder asc, name asc) {
        _id,
        name,
        slug,
        width,
        length,
        displayOrder
      }`
    );

    return NextResponse.json({ sizes }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching sizes:", error);
    return NextResponse.json(
      { error: "Failed to fetch sizes", message: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new size
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, width, length, displayOrder } = body;

    if (!name || width === undefined || length === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const newSize = await client.create({
      _type: "size",
      name,
      slug: { current: slug, _type: "slug" },
      width,
      length,
      displayOrder: displayOrder || 0,
    });

    return NextResponse.json(
      { message: "Size created successfully", size: newSize },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating size:", error);
    return NextResponse.json(
      { error: "Failed to create size", message: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update size
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const body = await req.json();
    const { name, width, length, displayOrder } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Size ID is required" },
        { status: 400 }
      );
    }

    if (!name || width === undefined || length === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const updatedSize = await client
      .patch(id)
      .set({
        name,
        slug: { current: slug, _type: "slug" },
        width,
        length,
        displayOrder: displayOrder || 0,
      })
      .commit();

    return NextResponse.json(
      { message: "Size updated successfully", size: updatedSize },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating size:", error);
    return NextResponse.json(
      { error: "Failed to update size", message: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete size
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Size ID is required" },
        { status: 400 }
      );
    }

    await client.delete(id);

    return NextResponse.json(
      { message: "Size deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting size:", error);
    return NextResponse.json(
      { error: "Failed to delete size", message: error.message },
      { status: 500 }
    );
  }
}
