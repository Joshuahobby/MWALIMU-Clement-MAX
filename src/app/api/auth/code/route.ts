import { type NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/paymentService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Missing access code' },
        { status: 400 }
      );
    }

    const user = await PaymentService.loginWithCode(code);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired access code' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        subscriptionType: user.subscriptionType,
        subscriptionExpiry: user.subscriptionExpiry,
      },
    });
  } catch (error) {
    console.error('Code authentication error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Authentication failed' },
      { status: 500 }
    );
  }
}
