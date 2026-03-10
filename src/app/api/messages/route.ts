import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

function getSupabase() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const practice_id = searchParams.get('practice_id');
    const patient_id = searchParams.get('patient_id');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    if (!practice_id || !patient_id) {
      return NextResponse.json(
        { error: 'practice_id and patient_id are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:profiles(full_name, avatar_url)')
      .eq('practice_id', practice_id)
      .eq('patient_id', patient_id)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { practice_id, patient_id, content } = body;

    if (!practice_id || !patient_id || !content) {
      return NextResponse.json(
        { error: 'practice_id, patient_id, and content are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        practice_id,
        patient_id,
        sender_id: user.id,
        content,
        message_type: body.message_type || 'text',
        attachment_url: body.attachment_url,
        is_read: false,
      })
      .select('*, sender:profiles(full_name, avatar_url)')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { practice_id, patient_id } = body;

    if (!practice_id || !patient_id) {
      return NextResponse.json(
        { error: 'practice_id and patient_id are required' },
        { status: 400 }
      );
    }

    // Mark all unread messages in this conversation as read (for the current user)
    const { data, error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('practice_id', practice_id)
      .eq('patient_id', patient_id)
      .eq('is_read', false)
      .neq('sender_id', user.id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: `${data?.length || 0} messages marked as read` });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
