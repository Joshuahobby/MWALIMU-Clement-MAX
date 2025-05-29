import { type NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/paymentService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId } = body;

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Missing paymentId' },
        { status: 400 }
      );
    }

    const payment = await PaymentService.verifyPayment(paymentId);

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        accessCode: payment.accessCode,
        completedAt: payment.completedAt,
        transactionId: payment.transactionId,
      },
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Payment verification failed' },
      { status: 500 }
    );
  }
}
