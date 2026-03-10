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
      .from('pattern_differentiations')
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

    const { data, error } = await supabase
      .from('pattern_differentiations')
      .insert({
        practice_id,
        patient_id,
        practitioner_id: user.id,
        tongue_analysis_id: body.tongue_analysis_id,
        pulse_diagnosis_id: body.pulse_diagnosis_id,
        symptoms: body.symptoms || [],
        signs: body.signs || [],
        primary_pattern: body.primary_pattern,
        secondary_patterns: body.secondary_patterns || [],
        eight_principles: body.eight_principles || {},
        zang_fu_patterns: body.zang_fu_patterns || [],
        qi_blood_fluid: body.qi_blood_fluid || [],
        six_stages: body.six_stages,
        four_levels: body.four_levels,
        san_jiao: body.san_jiao,
        ai_analysis: body.ai_analysis,
        ai_confidence: body.ai_confidence,
        practitioner_notes: body.practitioner_notes,
        treatment_principles: body.treatment_principles || [],
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
