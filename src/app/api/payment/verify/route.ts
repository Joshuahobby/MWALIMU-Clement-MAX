import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { payment_id } = await request.json();

    if (!payment_id) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    
    // Get payment details
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*, users(subscription_type, subscription_end)')
      .eq('id', payment_id)
      .single();

    if (paymentError) {
      console.error('Error fetching payment:', paymentError);
      return NextResponse.json(
        { error: 'Failed to fetch payment details' },
        { status: 500 }
      );
    }

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Get access code for the payment
    const { data: accessCodes, error: accessCodeError } = await supabase
      .from('access_codes')
      .select('*')
      .eq('user_id', payment.user_id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (accessCodeError) {
      console.error('Error fetching access code:', accessCodeError);
      return NextResponse.json(
        { error: 'Failed to fetch access code' },
        { status: 500 }
      );
    }

    const accessCode = accessCodes && accessCodes.length > 0 ? accessCodes[0] : null;

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        subscription_type: payment.subscription_type,
        created_at: payment.created_at
      },
      user: {
        subscription_type: payment.users?.subscription_type,
        subscription_end: payment.users?.subscription_end
      },
      access_code: accessCode ? {
        code: accessCode.code,
        valid_until: accessCode.valid_until
      } : null
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
