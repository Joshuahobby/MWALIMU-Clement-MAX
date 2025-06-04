import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Access code is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    
    // Call the validate_access_code function
    const { data, error } = await supabase
      .rpc('validate_access_code', { code_param: code });

    if (error) {
      console.error('Error validating access code:', error);
      return NextResponse.json(
        { error: 'Failed to validate access code' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired access code' },
        { status: 400 }
      );
    }

    const accessInfo = data[0];
    
    // Create a session for the user
    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
      email: `${accessInfo.user_id}@mwalimu-clement.com`,
      password: code,
    });

    if (sessionError) {
      // If the user doesn't exist, create a temporary account
      const { data: newUser, error: createError } = await supabase.auth.signUp({
        email: `${accessInfo.user_id}@mwalimu-clement.com`,
        password: code,
      });

      if (createError) {
        console.error('Error creating user:', createError);
        return NextResponse.json(
          { error: 'Authentication failed' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      user_id: accessInfo.user_id,
      subscription_type: accessInfo.subscription_type,
      valid_until: accessInfo.valid_until
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
