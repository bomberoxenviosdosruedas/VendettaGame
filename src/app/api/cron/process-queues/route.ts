import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Create a Supabase client with the Service Role Key to bypass RLS
  // The 'procesar_colas' function might not be SECURITY DEFINER, so we need admin privileges.
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { error } = await supabaseAdmin.rpc('procesar_colas');

    if (error) {
      console.error('Error processing queues:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ processed: true });
  } catch (err: any) {
    console.error('Unexpected error processing queues:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
