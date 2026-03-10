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
    const patient_id = searchParams.get('patient_id');
    const practice_id = searchParams.get('practice_id');

    if (!practice_id) {
      return NextResponse.json({ error: 'practice_id is required' }, { status: 400 });
    }

    let query = supabase
      .from('pulse_diagnoses')
      .select('*')
      .eq('practice_id', practice_id)
      .order('created_at', { ascending: false });

    if (patient_id) {
      query = query.eq('patient_id', patient_id);
    }

    const { data, error } = await query;
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
    const { practice_id, patient_id } = body;

    if (!practice_id || !patient_id) {
      return NextResponse.json(
        { error: 'practice_id and patient_id are required' },
        { status: 400 }
      );
    }

    const defaultPosition = {
      qualities: [],
      organ: '',
      depth: '',
      strength: '',
      notes: '',
    };

    const { data, error } = await supabase
      .from('pulse_diagnoses')
      .insert({
        practice_id,
        patient_id,
        practitioner_id: user.id,
        left_cun: body.left_cun || defaultPosition,
        left_guan: body.left_guan || defaultPosition,
        left_chi: body.left_chi || defaultPosition,
        right_cun: body.right_cun || defaultPosition,
        right_guan: body.right_guan || defaultPosition,
        right_chi: body.right_chi || defaultPosition,
        overall_rate: body.overall_rate,
        overall_notes: body.overall_notes,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
