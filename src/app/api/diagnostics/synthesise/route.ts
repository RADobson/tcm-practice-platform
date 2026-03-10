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
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

async function synthesisePatterns(diagnosticData: Record<string, unknown>): Promise<Record<string, unknown>> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { error: 'OpenAI API key not configured' };
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a senior TCM diagnostician performing comprehensive pattern differentiation. Given all available diagnostic data for a patient, synthesise a complete differential diagnosis.

Return valid JSON with this structure:
{
  "pattern_differentials": [
    {
      "pattern": "Pattern name",
      "confidence": 0.85,
      "supporting_evidence": ["List of findings that support this pattern"],
      "contradicting_evidence": ["List of findings that don't fit"],
      "zang_fu": ["Affected organ systems"],
      "eight_principles": {
        "yin_yang": "Yin|Yang",
        "interior_exterior": "Interior|Exterior",
        "cold_heat": "Cold|Heat",
        "deficiency_excess": "Deficiency|Excess"
      },
      "six_stages": "Stage if applicable or null",
      "san_jiao": "Level if applicable or null",
      "wei_qi_ying_xue": "Level if applicable or null"
    }
  ],
  "primary_pattern": "Most likely primary pattern",
  "pattern_relationships": "How the patterns relate to each other (e.g. root vs manifestation)",
  "contradictions": ["Any unusual or contradictory presentations noted"],
  "additional_questions": [
    {
      "question": "What to ask the patient",
      "reasoning": "Why this would help narrow the differential"
    }
  ],
  "diagnostic_summary": "Overall synthesis narrative connecting all findings"
}

Consider all TCM diagnostic frameworks: Zang-Fu theory, Eight Principles (Ba Gang), Six Stages (Liu Jing), San Jiao differentiation, Wei-Qi-Ying-Xue levels, Qi-Blood-Fluid pathology. Rank differentials by confidence. Flag contradictions.`,
        },
        {
          role: 'user',
          content: `Please synthesise a comprehensive TCM differential diagnosis from the following patient data:\n\n${JSON.stringify(diagnosticData, null, 2)}`,
        },
      ],
      max_tokens: 3000,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content || '';

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  return { diagnostic_summary: content, pattern_differentials: [] };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { patient_id, practice_id } = body;

    if (!patient_id || !practice_id) {
      return NextResponse.json({ error: 'patient_id and practice_id are required' }, { status: 400 });
    }

    // Gather all diagnostic data for the patient
    const [tongueRes, pulseRes, symptomsRes, patternsRes, notesRes, intakeRes] = await Promise.all([
      supabase
        .from('tongue_analyses')
        .select('*')
        .eq('patient_id', patient_id)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('pulse_diagnoses')
        .select('*')
        .eq('patient_id', patient_id)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('symptom_diary')
        .select('*')
        .eq('patient_id', patient_id)
        .order('entry_date', { ascending: false })
        .limit(10),
      supabase
        .from('pattern_differentiations')
        .select('*')
        .eq('patient_id', patient_id)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('clinical_notes')
        .select('subjective, objective, assessment, plan, tongue_notes, pulse_notes, pattern_diagnosis')
        .eq('patient_id', patient_id)
        .order('visit_date', { ascending: false })
        .limit(5),
      supabase
        .from('patient_intakes')
        .select('*')
        .eq('patient_id', patient_id)
        .eq('status', 'submitted')
        .order('created_at', { ascending: false })
        .limit(1),
    ]);

    // Get patient info
    const { data: patient } = await supabase
      .from('patients')
      .select('first_name, last_name, date_of_birth, gender, chief_complaint, medical_history, medications, allergies')
      .eq('id', patient_id)
      .single();

    const diagnosticData = {
      patient_info: patient,
      tongue_analyses: tongueRes.data || [],
      pulse_diagnoses: pulseRes.data || [],
      symptom_diary: symptomsRes.data || [],
      previous_patterns: patternsRes.data || [],
      clinical_notes: notesRes.data || [],
      intake_forms: intakeRes.data || [],
    };

    const synthesis = await synthesisePatterns(diagnosticData);

    // Save to pattern_differentiations
    if (body.save) {
      const typedSynthesis = synthesis as {
        primary_pattern?: string;
        pattern_differentials?: Array<{
          pattern?: string;
          confidence?: number;
          eight_principles?: Record<string, string>;
          zang_fu?: string[];
          six_stages?: string;
          san_jiao?: string;
          wei_qi_ying_xue?: string;
        }>;
        diagnostic_summary?: string;
      };
      const primaryPattern = typedSynthesis.primary_pattern || '';
      const differentials = typedSynthesis.pattern_differentials || [];

      const { data, error } = await supabase
        .from('pattern_differentiations')
        .insert({
          practice_id,
          patient_id,
          practitioner_id: user.id,
          tongue_analysis_id: tongueRes.data?.[0]?.id || null,
          pulse_diagnosis_id: pulseRes.data?.[0]?.id || null,
          symptoms: differentials.flatMap((d: { pattern?: string }) => d.pattern ? [d.pattern] : []),
          primary_pattern: primaryPattern,
          secondary_patterns: differentials.slice(1).map((d: { pattern?: string }) => d.pattern || ''),
          eight_principles: differentials[0]?.eight_principles || {},
          zang_fu_patterns: differentials.flatMap((d: { zang_fu?: string[] }) => d.zang_fu || []),
          six_stages: differentials[0]?.six_stages || null,
          four_levels: differentials[0]?.wei_qi_ying_xue || null,
          san_jiao: differentials[0]?.san_jiao || null,
          ai_analysis: typedSynthesis.diagnostic_summary || JSON.stringify(synthesis),
          ai_confidence: differentials[0]?.confidence || null,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ synthesis, saved_record: data }, { status: 201 });
    }

    return NextResponse.json(synthesis);
  } catch (err) {
    console.error('Synthesis error:', err);
    return NextResponse.json({ error: 'Failed to synthesise patterns' }, { status: 500 });
  }
}
