import { NextRequest, NextResponse } from 'next/server';
import { PayoutService } from '@/lib/commission/PayoutService';
import { CommissionService } from '@/lib/commission/CommissionService';

export async function GET(request: NextRequest) {
  // Verify the request is from a cron job (Vercel Cron or external service)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Starting automated payout process...');
    
    const payoutService = PayoutService.getInstance();
    const commissionService = CommissionService.getInstance();

    // Step 1: Settle pending funds (14-day hold period)
    console.log('Settling pending funds...');
    await commissionService.settlePendingFunds();

    // Step 2: Process automatic payouts
    console.log('Processing automatic payouts...');
    await payoutService.runAutomaticPayouts();

    return NextResponse.json({
      success: true,
      message: 'Automated payouts processed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in automated payout process:', error);
    
    // Log the error for monitoring
    // In production, you'd want to send this to your error tracking service
    
    return NextResponse.json(
      { 
        error: 'Failed to process automated payouts',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}