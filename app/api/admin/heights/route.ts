import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/lib/backendClient";

// GET - Fetch all heights
export async function GET() {
  try {
    const heights = await client.fetch(
      `*[_type == "height"] | order(displayOrder asc, value asc) {
        _id,
        name,
        slug,
        value,
        displayOrder
      }`
    );

    return NextResponse.json({ heights }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching heights:", error);
    return NextResponse.json(
      { error: "Failed to fetch heights", message: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new height
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, value, displayOrder } = body;

    if (!name || value === undefined) {
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

    const newHeight = await client.create({
      _type: "height",
      name,
      slug: { current: slug, _type: "slug" },
      value,
      displayOrder: displayOrder || 0,
    });

    return NextResponse.json(
      { message: "Height created successfully", height: newHeight },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating height:", error);
    return NextResponse.json(
      { error: "Failed to create height", message: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update height
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const body = await req.json();
    const { name, value, displayOrder } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Height ID is required" },
        { status: 400 }
      );
    }

    if (!name || value === undefined) {
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

    const updatedHeight = await client
      .patch(id)
      .set({
        name,
        slug: { current: slug, _type: "slug" },
        value,
        displayOrder: displayOrder || 0,
      })
      .commit();

    return NextResponse.json(
      { message: "Height updated successfully", height: updatedHeight },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating height:", error);
    return NextResponse.json(
      { error: "Failed to update height", message: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete height
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Height ID is required" },
        { status: 400 }
      );
    }

    await client.delete(id);

    return NextResponse.json(
      { message: "Height deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting height:", error);
    return NextResponse.json(
      { error: "Failed to delete height", message: error.message },
      { status: 500 }
    );
  }
}
