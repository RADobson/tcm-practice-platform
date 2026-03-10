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

async function analyseIntake(intakeData: Record<string, unknown>): Promise<Record<string, unknown>> {
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
          content: `You are a TCM clinical assistant analysing a patient intake form before their appointment. Generate a pre-consultation brief for the practitioner.

Return valid JSON with this structure:
{
  "likely_patterns": [
    {
      "pattern": "TCM pattern name",
      "confidence": "high|medium|low",
      "supporting_symptoms": ["List of symptoms from intake that suggest this pattern"]
    }
  ],
  "red_flags": [
    {
      "finding": "What was reported",
      "concern": "Why this is a red flag",
      "action": "Recommended action (e.g. 'Refer to GP for evaluation')"
    }
  ],
  "focus_areas": [
    {
      "area": "Diagnostic area to focus on",
      "reasoning": "Why this area needs attention"
    }
  ],
  "suggested_questions": [
    {
      "question": "Question to ask during consultation",
      "reasoning": "Why this question would be clinically useful"
    }
  ],
  "summary": "Brief narrative summary of the intake findings for the practitioner"
}

Red flags requiring referral include: unexplained weight loss, chest pain, shortness of breath at rest, severe headaches with visual changes, blood in stool/urine, signs of stroke, suicidal ideation, suspected fractures, signs of abuse. Always err on the side of caution for safety.`,
        },
        {
          role: 'user',
          content: `Please analyse this patient intake form and generate a pre-consultation brief:\n\n${JSON.stringify(intakeData, null, 2)}`,
        },
      ],
      max_tokens: 2000,
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

  return { summary: content, likely_patterns: [], red_flags: [], focus_areas: [], suggested_questions: [] };
}

// POST: Submit intake form (patient-facing) or trigger analysis (practitioner)
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    // Patient submitting intake form
    if (action === 'submit') {
      const { practice_id, patient_id, appointment_id, ...formData } = body;

      if (!practice_id || !patient_id) {
        return NextResponse.json({ error: 'practice_id and patient_id are required' }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('patient_intakes')
        .insert({
          practice_id,
          patient_id,
          appointment_id: appointment_id || null,
          chief_complaint: formData.chief_complaint,
          medical_history: formData.medical_history,
          current_medications: formData.current_medications,
          allergies: formData.allergies,
          sleep_quality: formData.sleep_quality,
          sleep_hours: formData.sleep_hours,
          digestion: formData.digestion,
          appetite: formData.appetite,
          thirst: formData.thirst,
          urination: formData.urination,
          bowel_movements: formData.bowel_movements,
          menstrual_notes: formData.menstrual_notes,
          emotions: formData.emotions,
          energy_level: formData.energy_level,
          pain_description: formData.pain_description,
          temperature_preference: formData.temperature_preference,
          sweating: formData.sweating,
          additional_notes: formData.additional_notes,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Auto-trigger AI analysis
      const intakeFields = {
        chief_complaint: formData.chief_complaint,
        medical_history: formData.medical_history,
        current_medications: formData.current_medications,
        allergies: formData.allergies,
        sleep_quality: formData.sleep_quality,
        sleep_hours: formData.sleep_hours,
        digestion: formData.digestion,
        appetite: formData.appetite,
        thirst: formData.thirst,
        urination: formData.urination,
        bowel_movements: formData.bowel_movements,
        menstrual_notes: formData.menstrual_notes,
        emotions: formData.emotions,
        energy_level: formData.energy_level,
        pain_description: formData.pain_description,
        temperature_preference: formData.temperature_preference,
        sweating: formData.sweating,
        additional_notes: formData.additional_notes,
      };

      try {
        const aiAnalysis = await analyseIntake(intakeFields);

        await supabase
          .from('patient_intakes')
          .update({
            ai_analysis: aiAnalysis,
            status: 'analysed',
          })
          .eq('id', data.id);

        return NextResponse.json({ intake: { ...data, ai_analysis: aiAnalysis, status: 'analysed' } }, { status: 201 });
      } catch {
        // If AI analysis fails, still return the saved intake
        return NextResponse.json({ intake: data }, { status: 201 });
      }
    }

    // Practitioner triggering re-analysis
    if (action === 'analyse') {
      const { intake_id } = body;
      if (!intake_id) {
        return NextResponse.json({ error: 'intake_id is required' }, { status: 400 });
      }

      const { data: intake, error } = await supabase
        .from('patient_intakes')
        .select('*')
        .eq('id', intake_id)
        .single();

      if (error || !intake) {
        return NextResponse.json({ error: 'Intake not found' }, { status: 404 });
      }

      const aiAnalysis = await analyseIntake(intake);

      await supabase
        .from('patient_intakes')
        .update({
          ai_analysis: aiAnalysis,
          status: 'analysed',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', intake_id);

      return NextResponse.json({ ai_analysis: aiAnalysis });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Intake analysis error:', err);
    return NextResponse.json({ error: 'Failed to process intake' }, { status: 500 });
  }
}

// GET: Fetch intakes for a patient or practice
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
    const status = searchParams.get('status');

    let query = supabase
      .from('patient_intakes')
      .select('*, patients(first_name, last_name)')
      .order('created_at', { ascending: false });

    if (practice_id) query = query.eq('practice_id', practice_id);
    if (patient_id) query = query.eq('patient_id', patient_id);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
