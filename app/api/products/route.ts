import { NextRequest, NextResponse } from "next/server";
import { getAllProducts } from "@/sanity/helpers";
import { filterProducts } from "@/lib/productFilters";

const ITEMS_PER_PAGE = 12;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const category = searchParams.get("category") || undefined;
    const minPrice = searchParams.get("minPrice") || undefined;
    const maxPrice = searchParams.get("maxPrice") || undefined;
    const search = searchParams.get("search") || undefined;
    const availability = searchParams.get("availability")?.split(",") || undefined;
    const rating = searchParams.get("rating") || undefined;
    const sort = searchParams.get("sort") || "newest";

    // Fetch all products
    const allProducts = await getAllProducts();

    // Apply filters
    const filteredProducts = filterProducts(allProducts, {
      category,
      minPrice,
      maxPrice,
      search,
      availability,
      rating,
      sort,
    });

    // Calculate pagination
    const totalProducts = filteredProducts.length;
    const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return NextResponse.json({
      products: paginatedProducts,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        hasMore: page < totalPages,
        itemsPerPage: ITEMS_PER_PAGE,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
