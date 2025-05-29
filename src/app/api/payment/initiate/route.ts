import { type NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/paymentService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, planType, paymentMethod } = body;

    // Validation
    if (!phone || !planType || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields: phone, planType, paymentMethod' },
        { status: 400 }
      );
    }

    if (!['single', 'daily', 'weekly', 'monthly'].includes(planType)) {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      );
    }

    if (!['MTN', 'AIRTEL'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      );
    }

    const payment = await PaymentService.initiatePayment(phone, planType, paymentMethod);

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
      },
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Payment initiation failed' },
      { status: 500 }
    );
  }
}
