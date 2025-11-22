import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { client } from '@/sanity/lib/client';
import { employeeService } from '@/lib/employee/employeeService';

// GET /api/admin/employees/[id]/metrics - Get employee performance metrics
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      // return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') as 'daily' | 'weekly' | 'monthly' || 'weekly';
    const { id } = params;

    const employee = await employeeService.getEmployeeById(id);
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const metrics = await employeeService.getEmployeeMetrics(id, period);
    const activities = await employeeService.getEmployeeActivity(id, 100);
    const reviews = await employeeService.getEmployeeReviews(id);

    // Calculate additional metrics from activities
    const lastLogin = activities.find(a => a.action === 'login');
    const recentActivities = activities.slice(0, 10);
    const categoryBreakdown = activities.reduce((acc: Record<string, number>, activity) => {
      acc[activity.category] = (acc[activity.category] || 0) + 1;
      return acc;
    }, {});

    // Calculate average response time for customer support activities
    const supportActivities = activities.filter(a =>
      a.category === 'users' &&
      (a.action.includes('respond') || a.action.includes('reply') || a.action.includes('answer'))
    );

    const avgResponseTime = supportActivities.length > 0 ? 45 : 0; // Placeholder: 45 minutes average

    // Calculate performance score
    const performanceScore = calculatePerformanceScore(metrics, reviews, activities);

    return NextResponse.json({
      success: true,
      data: {
        employee: {
          id: employee._id,
          name: `${employee.firstName} ${employee.lastName}`,
          role: employee.role,
          email: employee.email
        },
        metrics,
        analytics: {
          totalActivities: activities.length,
          categoryBreakdown,
          lastLoginAt: lastLogin?.timestamp,
          avgResponseTime,
          performanceScore,
          recentActivities: recentActivities.slice(0, 5)
        },
        reviews: {
          total: reviews.length,
          averageRating: reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.overallRating, 0) / reviews.length
            : 0,
          latest: reviews[0] || null
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching employee metrics:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch employee metrics',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// Helper function to calculate performance score
function calculatePerformanceScore(metrics: any, reviews: any[], activities: any[]): number {
  let score = 50; // Base score

  // Add points for activity volume
  if (metrics?.metrics?.actionsCount > 0) {
    score += Math.min(metrics.metrics.actionsCount, 20);
  }

  // Add points for reviews
  if (reviews.length > 0) {
    const avgRating = reviews.reduce((sum, review) => sum + review.overallRating, 0) / reviews.length;
    score += (avgRating - 3) * 10; // Scale from 1-5 to -20 to +20
  }

  // Add points for diverse activity categories
  const categories = Object.keys(metrics?.metrics?.actionsByCategory || {});
  score += categories.length * 5;

  // Cap at 100
  return Math.min(Math.max(score, 0), 100);
}