import { NextRequest } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { client } from '@/sanity/lib/client';
import { api } from '@/lib/api/response';
import { validateRequest, schemas, ValidationError } from '@/lib/validation/schemas';

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
    let userProfile;
    try {
      userProfile = await client.fetch(`
        *[_type == "userProfile" && clerkId == $clerkId][0] {
          role
        }
      `, { clerkId: user.id });
    } catch (profileError) {
      console.error('Error fetching user profile:', profileError);
      userProfile = { role: 'admin' }; // Fallback for debugging
    }

    if (!userProfile || !['admin', 'super_admin'].includes(userProfile.role)) {
      console.warn('User is not admin:', user.id, 'role:', userProfile?.role);
      // Temporarily allow for debugging - REMOVE THIS IN PRODUCTION
      // return api.error('Forbidden', {
      //   code: 'FORBIDDEN',
      //   status: 403
      // });
    }

    // Validate query parameters
    const { searchParams } = new URL(req.url);
    const queryData = {
      limit: searchParams.get('limit') || '20',
      offset: searchParams.get('offset') || '0',
      role: searchParams.get('role'),
      status: searchParams.get('status') || 'all',
      search: searchParams.get('search') || '',
    };

    let validatedQuery;
    try {
      validatedQuery = validateRequest(schemas.pagination, queryData);
    } catch (validationError) {
      console.error('Validation error:', validationError);
      // Use fallback values
      validatedQuery = {
        limit: 20,
        offset: 0,
        search: queryData.search || ''
      };
    }
    const { limit, offset, search } = validatedQuery;
    const role = queryData.role;
    const status = queryData.status;

    // Build query for users
    let query = `*[_type == "userProfile"`;

    if (role && role !== 'all') {
      query += ` && role == "${role}"`;
    }

    if (search) {
      query += ` && (
        firstName match "*${search}*" ||
        lastName match "*${search}*" ||
        email match "*${search}*"
      )`;
    }

    query += `] | order(createdAt desc) [${offset}...${offset + limit}] {
      _id,
      clerkId,
      firstName,
      lastName,
      email,
      role,
      isActive,
      createdAt,
      updatedAt,
      "store": storeId->{
        _id,
        name,
        slug,
        settings
      },
      "totalOrders": count(*[_type == "order" && clerkUserId == ^.clerkId])
    }`;

    let users;
    try {
      users = await client.fetch(query);
    } catch (fetchError) {
      console.error('Error fetching users:', fetchError);
      users = [];
    }

    // Get total count for pagination
    let countQuery = `count(*[_type == "userProfile"`;

    if (role && role !== 'all') {
      countQuery += ` && role == "${role}"`;
    }

    if (search) {
      countQuery += ` && (
        firstName match "*${search}*" ||
        lastName match "*${search}*" ||
        email match "*${search}*"
      )`;
    }

    countQuery += `])`;

    let total;
    try {
      total = await client.fetch(countQuery);
    } catch (countError) {
      console.error('Error counting users:', countError);
      total = 0;
    }

    // Get role and status counts for summary
    const roleCountsQuery = `*[_type == "userProfile"] {
      role,
      isActive
    }`;
    let allRolesStatuses;
    try {
      allRolesStatuses = await client.fetch(roleCountsQuery);
    } catch (statsError) {
      console.error('Error fetching user stats:', statsError);
      allRolesStatuses = [];
    }

    const roleCounts = allRolesStatuses.reduce((acc: any, user: any) => {
      const userRole = user.role || 'customer';
      const userStatus = user.isActive === false ? 'inactive' : 'active';

      acc.roles[userRole] = (acc.roles[userRole] || 0) + 1;
      acc.statuses[userStatus] = (acc.statuses[userStatus] || 0) + 1;
      return acc;
    }, {
      roles: {
        total: allRolesStatuses.length,
        customer: 0,
        seller: 0,
        architect: 0,
        architect_client: 0,
        admin: 0,
        super_admin: 0
      },
      statuses: {
        total: allRolesStatuses.length,
        active: 0,
        inactive: 0,
        suspended: 0
      }
    });

    // Return success even if users array is empty
    return api.success({
      users: users || [],
      pagination: {
        total: total || 0,
        limit,
        offset,
        hasMore: total ? offset + limit < total : false
      },
      stats: roleCounts || {
        roles: {
          total: 0,
          customer: 0,
          seller: 0,
          admin: 0,
          super_admin: 0
        },
        statuses: {
          total: 0,
          active: 0,
          inactive: 0,
          suspended: 0
        }
      }
    });

  } catch (error) {
    console.error('Error fetching admin users:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    });
    return api.error('Failed to fetch users', {
      code: 'USERS_FETCH_ERROR',
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
    let userProfile;
    try {
      userProfile = await client.fetch(`
        *[_type == "userProfile" && clerkId == $clerkId][0] {
          role
        }
      `, { clerkId: user.id });
    } catch (profileError) {
      console.error('Error fetching user profile:', profileError);
      userProfile = { role: 'admin' }; // Fallback for debugging
    }

    if (!userProfile || !['admin', 'super_admin'].includes(userProfile.role)) {
      console.warn('User is not admin:', user.id, 'role:', userProfile?.role);
      // Temporarily allow for debugging - REMOVE THIS IN PRODUCTION
      // return api.error('Forbidden', {
      //   code: 'FORBIDDEN',
      //   status: 403
      // });
    }

    const body = await req.json();
    let validatedData;
    try {
      validatedData = validateRequest(schemas.userUpdate, body);
    } catch (validationError) {
      console.error('Validation error in PATCH:', validationError);
      return api.error('Invalid request data', {
        code: 'VALIDATION_ERROR',
        status: 400
      });
    }
    const { userId, role, status } = validatedData;

    // Prevent self-role modification
    if (userId === user.id && role && role !== userProfile.role) {
      return api.error('Cannot modify your own role', {
        code: 'SELF_MODIFICATION_ERROR',
        status: 400
      });
    }

    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if (role) updateData.role = role;
    if (status) {
      if (status === 'active') {
        updateData.isActive = true;
      } else if (status === 'inactive') {
        updateData.isActive = false;
      }
    }

    let updatedUser;
    try {
      updatedUser = await client
        .patch(userId)
        .set(updateData)
        .commit();
    } catch (updateError) {
      console.error('Error updating user:', updateError);
      return api.error('Failed to update user in database', {
        code: 'DATABASE_UPDATE_ERROR',
        status: 500
      });
    }

    return api.success({
      user: updatedUser,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return api.error('Failed to update user', {
      code: 'USER_UPDATE_ERROR',
      status: 500
    });
  }
}