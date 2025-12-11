import { NextRequest } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { client } from '@/sanity/lib/client';
import { api } from '@/lib/api/response';

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return api.error('Unauthorized', {
        code: 'UNAUTHORIZED',
        status: 401
      });
    }

    // Check if user is admin
    const userProfile = await client.fetch(`
      *[_type == "userProfile" && clerkId == $clerkId][0] {
        role
      }
    `, { clerkId: user.id });

    if (!userProfile || !['admin', 'super_admin'].includes(userProfile.role)) {
      return api.error('Forbidden', {
        code: 'FORBIDDEN',
        status: 403
      });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');
    const storeId = searchParams.get('storeId');
    const category = searchParams.get('category');
    const search = searchParams.get('search') || '';

    // Build query for products
    let query = `*[_type == "product"`;

    if (status && status !== 'all') {
      query += ` && status == "${status}"`;
    }

    if (storeId) {
      query += ` && store._ref == "${storeId}"`;
    }

    if (category) {
      query += ` && $category in categories[]._ref`;
    }

    if (search) {
      query += ` && (
        name match "*${search}*" ||
        description match "*${search}*"
      )`;
    }

    query += `] | order(_createdAt desc) [${offset}...${offset + limit}] {
      _id,
      name,
      slug,
      "image": image {
        ...,
        "url": asset->url
      },
      description,
      price,
      discount,
      stock,
      label,
      status,
      isApproved,
      hasVariants,
      priceVariants[]{
        "size": size->{_id, name},
        "height": height->{_id, name},
        price,
        stock
      },
      _createdAt,
      _updatedAt,
      "categories": categories[]->{
        _id,
        title,
        slug
      },
      "navigationcategory": navigationcategory[]->{
        _id,
        title,
        slug
      }
    }`;

    const products = await client.fetch(query, { category });

    // Get total count for pagination
    let countQuery = `count(*[_type == "product"`;

    if (status && status !== 'all') {
      countQuery += ` && status == "${status}"`;
    }

    if (storeId) {
      countQuery += ` && store._ref == "${storeId}"`;
    }

    if (category) {
      countQuery += ` && $category in categories[]._ref`;
    }

    if (search) {
      countQuery += ` && (
        name match "*${search}*" ||
        description match "*${search}*"
      )`;
    }

    countQuery += `])`;

    const total = await client.fetch(countQuery, { category });

    // Get status counts for summary
    const statusCountsQuery = `*[_type == "product"] {
      status
    }`;
    const allStatuses = await client.fetch(statusCountsQuery);
    const statusCounts = allStatuses.reduce((acc: any, product: any) => {
      acc[product.status] = (acc[product.status] || 0) + 1;
      return acc;
    }, {
      total: allStatuses.length,
      new: 0,
      hot: 0,
      sale: 0
    });

    // Get store counts
    const storeCountsQuery = `*[_type == "product"] {
      "storeId": store._ref
    }`;
    const allStoreProducts = await client.fetch(storeCountsQuery);
    const storeCounts = allStoreProducts.reduce((acc: any, product: any) => {
      acc[product.storeId] = (acc[product.storeId] || 0) + 1;
      return acc;
    }, {});

    // Get approval stats
    const approvalStats = await client.fetch(`{
      "approved": count(*[_type == "product" && isApproved == true]),
      "pending": count(*[_type == "product" && isApproved == false]),
      "total": count(*[_type == "product"])
    }`);

    // Return success even if products array is empty
    return api.success({
      products: products || [],
      stats: {
        status: statusCounts || {
          total: 0,
          new: 0,
          hot: 0,
          sale: 0
        },
        approval: approvalStats || {
          approved: 0,
          pending: 0,
          total: 0
        },
        stores: storeCounts || {}
      },
      pagination: {
        total: total || 0,
        limit,
        offset,
        hasMore: total ? offset + limit < total : false
      }
    });

  } catch (error) {
    console.error('Error fetching admin products:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    });
    return api.error('Failed to fetch products', {
      code: 'PRODUCTS_FETCH_ERROR',
      status: 500,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return api.error('Unauthorized', {
        code: 'UNAUTHORIZED',
        status: 401
      });
    }

    // Check if user is admin
    const userProfile = await client.fetch(`
      *[_type == "userProfile" && clerkId == $clerkId][0] {
        role
      }
    `, { clerkId: user.id });

    if (!userProfile || !['admin', 'super_admin'].includes(userProfile.role)) {
      return api.error('Forbidden', {
        code: 'FORBIDDEN',
        status: 403
      });
    }

    const body = await req.json();
    const { productId, isApproved, status } = body;

    if (!productId) {
      return api.error('Product ID is required', {
        code: 'VALIDATION_ERROR',
        status: 400
      });
    }

    const updateData: any = {
      _updatedAt: new Date().toISOString()
    };

    if (typeof isApproved === 'boolean') updateData.isApproved = isApproved;
    if (status) updateData.status = status;

    const updatedProduct = await client
      .patch(productId)
      .set(updateData)
      .commit();

    return api.success({
      product: updatedProduct,
      message: 'Product updated successfully'
    });

  } catch (error) {
    console.error('Error updating product:', error);
    return api.error('Failed to update product', {
      code: 'PRODUCT_UPDATE_ERROR',
      status: 500
    });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return api.error('Unauthorized', {
        code: 'UNAUTHORIZED',
        status: 401
      });
    }

    // Check if user is admin
    const userProfile = await client.fetch(`
      *[_type == "userProfile" && clerkId == $clerkId][0] {
        role
      }
    `, { clerkId: user.id });

    if (!userProfile || !['admin', 'super_admin'].includes(userProfile.role)) {
      return api.error('Forbidden', {
        code: 'FORBIDDEN',
        status: 403
      });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('id');

    if (!productId) {
      return api.error('Product ID is required', {
        code: 'VALIDATION_ERROR',
        status: 400
      });
    }

    const body = await req.json();
    const {
      name,
      description,
      imageUrl,
      price,
      discount,
      stock,
      status,
      label,
      isApproved,
      categories,
      navigationCategories,
      hasVariants,
      priceVariants
    } = body;

    // Validate required fields
    if (!name || !price) {
      return api.error('Missing required fields: name and price are required', {
        code: 'VALIDATION_ERROR',
        status: 400
      });
    }

    if (!categories || categories.length === 0) {
      return api.error('At least one category is required', {
        code: 'VALIDATION_ERROR',
        status: 400
      });
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Prepare update data
    const updateData: any = {
      name,
      slug: { _type: 'slug', current: slug },
      description: description || '',
      price: parseFloat(price) || 0,
      discount: parseFloat(discount) || 0,
      stock: parseInt(stock) || 0,
      label: label || '',
      status: status || 'new',
      isApproved: typeof isApproved === 'boolean' ? isApproved : true,
      _updatedAt: new Date().toISOString()
    };

    // Update categories
    if (categories && categories.length > 0) {
      updateData.categories = categories.map((id: string) => ({ _type: 'reference', _ref: id }));
    }

    // Update navigation categories
    if (navigationCategories && navigationCategories.length > 0) {
      updateData.navigationcategory = navigationCategories.map((id: string) => ({ _type: 'reference', _ref: id }));
    } else {
      updateData.navigationcategory = [];
    }

    // Update image if provided
    if (imageUrl) {
      updateData.image = {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: imageUrl
        }
      };
    }

    // Update variants
    if (hasVariants) {
      updateData.hasVariants = true;
      if (priceVariants && priceVariants.length > 0) {
        updateData.priceVariants = priceVariants.map((variant: any) => ({
          _type: 'object',
          _key: Math.random().toString(36).substring(7),
          size: { _type: 'reference', _ref: variant.size },
          height: { _type: 'reference', _ref: variant.height },
          price: parseFloat(variant.price) || 0,
          stock: parseInt(variant.stock) || 0
        }));
      } else {
        updateData.priceVariants = [];
      }
    } else {
      updateData.hasVariants = false;
      updateData.priceVariants = [];
    }

    // Update product
    const updatedProduct = await client
      .patch(productId)
      .set(updateData)
      .commit();

    return api.success({
      message: 'Product updated successfully',
      product: updatedProduct
    });

  } catch (error) {
    console.error('Error updating product:', error);
    return api.error('Failed to update product', {
      code: 'PRODUCT_UPDATE_ERROR',
      status: 500,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return api.error('Unauthorized', {
        code: 'UNAUTHORIZED',
        status: 401
      });
    }

    // Check if user is admin
    const userProfile = await client.fetch(`
      *[_type == "userProfile" && clerkId == $clerkId][0] {
        role
      }
    `, { clerkId: user.id });

    if (!userProfile || !['admin', 'super_admin'].includes(userProfile.role)) {
      return api.error('Forbidden', {
        code: 'FORBIDDEN',
        status: 403
      });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return api.error('Product ID is required', {
        code: 'VALIDATION_ERROR',
        status: 400
      });
    }

    await client.delete(productId);

    return api.success({
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    return api.error('Failed to delete product', {
      code: 'PRODUCT_DELETE_ERROR',
      status: 500
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return api.error('Unauthorized', {
        code: 'UNAUTHORIZED',
        status: 401
      });
    }

    // Check if user is admin
    const userProfile = await client.fetch(`
      *[_type == "userProfile" && clerkId == $clerkId][0] {
        role
      }
    `, { clerkId: user.id });

    if (!userProfile || !['admin', 'super_admin'].includes(userProfile.role)) {
      return api.error('Forbidden', {
        code: 'FORBIDDEN',
        status: 403
      });
    }

    const contentType = req.headers.get('content-type');

    // Handle single product creation (JSON)
    if (contentType?.includes('application/json')) {
      const body = await req.json();
      const {
        name,
        description,
        price,
        discount,
        stock,
        status,
        label,
        commissionRate,
        isApproved,
        storeId,
        categories,
        navigationCategories,
        imageUrl,
        hasVariants,
        priceVariants
      } = body;

      // Validate required fields
      if (!name || !price) {
        return api.error('Missing required fields: name and price are required', {
          code: 'VALIDATION_ERROR',
          status: 400
        });
      }

      // Validate categories (at least one required for single-store model)
      if (!categories || categories.length === 0) {
        return api.error('At least one category is required', {
          code: 'VALIDATION_ERROR',
          status: 400
        });
      }

      // Generate slug from name
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Prepare product data (single-store model - no store reference)
      const productData: any = {
        _type: 'product',
        name,
        slug: { _type: 'slug', current: slug },
        description: description || '',
        price: parseFloat(price) || 0,
        discount: parseFloat(discount) || 0,
        stock: parseInt(stock) || 0,
        label: label || '',
        status: status || 'new',
        isApproved: typeof isApproved === 'boolean' ? isApproved : true,
        _createdAt: new Date().toISOString(),
        _updatedAt: new Date().toISOString()
      };

      // Add categories if provided
      if (categories && categories.length > 0) {
        productData.categories = categories.map((id: string) => ({ _type: 'reference', _ref: id }));
      }

      // Add navigation categories if provided
      if (navigationCategories && navigationCategories.length > 0) {
        productData.navigationcategory = navigationCategories.map((id: string) => ({ _type: 'reference', _ref: id }));
      }

      // Add image if provided
      if (imageUrl) {
        productData.image = {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: imageUrl
          }
        };
      }

      // Add variants if provided
      if (hasVariants) {
        productData.hasVariants = true;
        if (priceVariants && priceVariants.length > 0) {
          productData.priceVariants = priceVariants.map((variant: any) => ({
            _type: 'object',
            _key: Math.random().toString(36).substring(7), // Generate unique key
            size: { _type: 'reference', _ref: variant.size },
            height: { _type: 'reference', _ref: variant.height },
            price: parseFloat(variant.price) || 0,
            stock: parseInt(variant.stock) || 0
          }));
        }
      } else {
        productData.hasVariants = false;
      }

      // Create product in Sanity
      const createdProduct = await client.create(productData);

      return api.success({
        message: 'Product created successfully',
        product: createdProduct
      });
    }

    // Handle bulk upload (multipart/form-data)
    if (!contentType?.includes('multipart/form-data')) {
      return api.error('Invalid content type. Expected application/json or multipart/form-data', {
        code: 'INVALID_CONTENT_TYPE',
        status: 400
      });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return api.error('File is required', {
        code: 'VALIDATION_ERROR',
        status: 400
      });
    }

    // Validate file type
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      return api.error('Invalid file type. Please upload an Excel file (.xlsx or .xls)', {
        code: 'INVALID_FILE_TYPE',
        status: 400
      });
    }

    // Get categories for reference validation
    const categories = await client.fetch(`
      *[_type == "category"] {
        _id,
        name,
        slug
      }
    `);

    // Get navigation categories for reference validation
    const navigationCategories = await client.fetch(`
      *[_type == "navigationcategory"] {
        _id,
        name,
        slug
      }
    `);

    // Parse the Excel file
    const arrayBuffer = await file.arrayBuffer();
    const workbook = await import('xlsx').then(xlsx => xlsx.read(arrayBuffer, { type: 'array' }));

    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return api.error('Excel file is empty', {
        code: 'EMPTY_FILE',
        status: 400
      });
    }

    const worksheet = workbook.Sheets[sheetName];
    const jsonData = await import('xlsx').then(xlsx => xlsx.utils.sheet_to_json(worksheet));

    if (!jsonData || jsonData.length === 0) {
      return api.error('No data found in Excel file', {
        code: 'NO_DATA',
        status: 400
      });
    }

    const results = {
      success: [] as any[],
      errors: [] as any[],
      total: jsonData.length
    };

    // Process each row
    for (let i = 0; i < jsonData.length; i++) {
      const row: any = jsonData[i];
      const rowNumber = i + 2; // Excel row numbers start from 1, plus header row

      try {
        // Validate required fields
        if (!row.name || !row.price) {
          results.errors.push({
            row: rowNumber,
            error: 'Missing required fields: name and price are required',
            data: row
          });
          continue;
        }

        // Find category references
        const categoryRefs: any[] = [];
        if (row.categories) {
          const categoryNames = row.categories.split(',').map((name: string) => name.trim());
          for (const catName of categoryNames) {
            const category = categories.find((c: any) =>
              c.name.toLowerCase() === catName.toLowerCase() ||
              c.slug.current.toLowerCase() === catName.toLowerCase()
            );
            if (category) {
              categoryRefs.push({ _type: 'reference', _ref: category._id });
            }
          }
        }

        // Find navigation category references
        const navCategoryRefs: any[] = [];
        if (row.navigationCategories || row.sectionCategories) {
          const navCategoryNames = (row.navigationCategories || row.sectionCategories).split(',').map((name: string) => name.trim());
          for (const catName of navCategoryNames) {
            const navCategory = navigationCategories.find((c: any) =>
              c.name.toLowerCase() === catName.toLowerCase() ||
              c.slug.current.toLowerCase() === catName.toLowerCase()
            );
            if (navCategory) {
              navCategoryRefs.push({ _type: 'reference', _ref: navCategory._id });
            }
          }
        }

        // Generate slug from name
        const slug = row.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        // Prepare product data (single-store model - no store reference)
        const productData = {
          _type: 'product',
          name: row.name,
          slug: { _type: 'slug', current: slug },
          description: row.description || '',
          price: parseFloat(row.price) || 0,
          discount: parseFloat(row.discount) || 0,
          stock: parseInt(row.stock) || 0,
          label: row.label || '',
          status: row.status || 'new',
          categories: categoryRefs,
          navigationcategory: navCategoryRefs,
          _createdAt: new Date().toISOString(),
          _updatedAt: new Date().toISOString()
        };

        // Create product in Sanity
        const createdProduct = await client.create(productData);
        results.success.push({
          row: rowNumber,
          productId: createdProduct._id,
          name: productData.name
        });

      } catch (error) {
        console.error(`Error processing row ${rowNumber}:`, error);
        results.errors.push({
          row: rowNumber,
          error: error instanceof Error ? error.message : 'Unknown error',
          data: row
        });
      }
    }

    return api.success({
      message: `Bulk upload completed. ${results.success.length} products created, ${results.errors.length} errors occurred.`,
      results
    });

  } catch (error) {
    console.error('Error in bulk product upload:', error);
    return api.error('Failed to process bulk upload', {
      code: 'BULK_UPLOAD_ERROR',
      status: 500,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}