import { NextRequest, NextResponse } from 'next/server';
import { BackgroundJobs } from '@/lib/commission/BackgroundJobs';

export async function GET(request: NextRequest) {
  // Verify the request is from a cron job
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const jobType = searchParams.get('job') || 'weekly';

  try {
    console.log(`Starting ${jobType} maintenance job...`);
    
    const backgroundJobs = BackgroundJobs.getInstance();
    let result;

    switch (jobType) {
      case 'daily':
        result = await backgroundJobs.runDailyPayoutJob();
        break;
      case 'weekly':
        result = await backgroundJobs.runWeeklyMaintenanceJob();
        break;
      case 'monthly':
        result = await backgroundJobs.runMonthlyArchiveJob();
        break;
      case 'health':
        result = await backgroundJobs.runHealthCheck();
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid job type. Use: daily, weekly, monthly, or health' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      jobType,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`Error in ${jobType} maintenance job:`, error);
    
    return NextResponse.json(
      { 
        error: `Failed to run ${jobType} maintenance job`,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}