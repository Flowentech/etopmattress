import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'category';

    let query = '';

    if (type === 'navigationcategory') {
      query = `
        *[_type == "navigationcategory"] | order(title asc) {
          _id,
          title,
          slug,
          description
        }
      `;
    } else {
      query = `
        *[_type == "category"] | order(order asc, title asc) {
          _id,
          title,
          slug,
          description,
          level,
          order,
          "parent": parent-> {
            _id,
            title,
            slug
          },
          "image": image {
            asset-> {
              _id,
              url
            }
          }
        }
      `;
    }

    const categories = await client.fetch(query);

    return NextResponse.json(categories || []);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json([], { status: 500 });
  }
}
