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

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      practice_id,
      patient_id,
      export_type,
      start_date,
      end_date,
    } = body;

    if (!practice_id) {
      return NextResponse.json({ error: 'practice_id is required' }, { status: 400 });
    }

    // Fetch practice info
    const { data: practice } = await supabase
      .from('practices')
      .select('*')
      .eq('id', practice_id)
      .single();

    // Build patient filter
    const patientFilter: string | null = patient_id || null;

    // Fetch patient data
    let patientsQuery = supabase
      .from('patients')
      .select('*')
      .eq('practice_id', practice_id)
      .eq('is_active', true);

    if (patientFilter) {
      patientsQuery = patientsQuery.eq('id', patientFilter);
    }

    const { data: patients } = await patientsQuery;

    const result: Record<string, unknown> = {
      practice,
      patients: patients || [],
      generated_at: new Date().toISOString(),
      export_type,
    };

    const patientIds = (patients || []).map((p) => p.id);

    if (
      export_type === 'complete' ||
      export_type === 'clinical_notes'
    ) {
      let notesQuery = supabase
        .from('clinical_notes')
        .select('*')
        .eq('practice_id', practice_id)
        .order('visit_date', { ascending: false });

      if (patientFilter) {
        notesQuery = notesQuery.eq('patient_id', patientFilter);
      } else if (patientIds.length > 0) {
        notesQuery = notesQuery.in('patient_id', patientIds);
      }

      if (start_date) notesQuery = notesQuery.gte('visit_date', start_date);
      if (end_date) notesQuery = notesQuery.lte('visit_date', end_date);

      const { data: notes } = await notesQuery;
      result.clinical_notes = notes || [];
    }

    if (
      export_type === 'complete' ||
      export_type === 'treatments'
    ) {
      let treatmentsQuery = supabase
        .from('treatment_records')
        .select('*')
        .eq('practice_id', practice_id)
        .order('treatment_date', { ascending: false });

      if (patientFilter) {
        treatmentsQuery = treatmentsQuery.eq('patient_id', patientFilter);
      } else if (patientIds.length > 0) {
        treatmentsQuery = treatmentsQuery.in('patient_id', patientIds);
      }

      if (start_date) treatmentsQuery = treatmentsQuery.gte('treatment_date', start_date);
      if (end_date) treatmentsQuery = treatmentsQuery.lte('treatment_date', end_date);

      const { data: treatments } = await treatmentsQuery;
      result.treatments = treatments || [];
    }

    if (
      export_type === 'complete' ||
      export_type === 'billing'
    ) {
      let invoicesQuery = supabase
        .from('invoices')
        .select('*')
        .eq('practice_id', practice_id)
        .order('issue_date', { ascending: false });

      if (patientFilter) {
        invoicesQuery = invoicesQuery.eq('patient_id', patientFilter);
      } else if (patientIds.length > 0) {
        invoicesQuery = invoicesQuery.in('patient_id', patientIds);
      }

      if (start_date) invoicesQuery = invoicesQuery.gte('issue_date', start_date);
      if (end_date) invoicesQuery = invoicesQuery.lte('issue_date', end_date);

      const { data: invoices } = await invoicesQuery;
      result.invoices = invoices || [];
    }

    if (
      export_type === 'complete' ||
      export_type === 'herbal_formulas'
    ) {
      let herbsQuery = supabase
        .from('herbal_formulas')
        .select('*')
        .eq('practice_id', practice_id)
        .order('created_at', { ascending: false });

      if (patientFilter) {
        herbsQuery = herbsQuery.eq('patient_id', patientFilter);
      }

      const { data: formulas } = await herbsQuery;
      result.herbal_formulas = formulas || [];
    }

    // For complete export, also fetch diagnostics
    if (export_type === 'complete') {
      if (patientFilter) {
        const { data: tongueData } = await supabase
          .from('tongue_analyses')
          .select('*')
          .eq('patient_id', patientFilter)
          .order('created_at', { ascending: false });

        const { data: pulseData } = await supabase
          .from('pulse_diagnoses')
          .select('*')
          .eq('patient_id', patientFilter)
          .eq('practice_id', practice_id)
          .order('created_at', { ascending: false });

        const { data: patternData } = await supabase
          .from('pattern_differentiations')
          .select('*')
          .eq('patient_id', patientFilter)
          .eq('practice_id', practice_id)
          .order('created_at', { ascending: false });

        result.tongue_analyses = tongueData || [];
        result.pulse_diagnoses = pulseData || [];
        result.pattern_differentiations = patternData || [];
      }
    }

    return NextResponse.json(result);
  } catch (e) {
    console.error('Export error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
