import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { generateEmailHtml } from './email-template';
import { buildVisualizationData } from '@/lib/qi-flow-engine';
import type { TreatedPoint, PathologyState, PathologyType } from '@/lib/types';

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

const TECHNIQUE_MAP: Record<string, { technique: string; chinese: string }> = {
  tonify: { technique: 'tonify', chinese: '补法' },
  tonifying: { technique: 'tonify', chinese: '补法' },
  reduce: { technique: 'reduce', chinese: '泻法' },
  reducing: { technique: 'reduce', chinese: '泻法' },
  sedating: { technique: 'reduce', chinese: '泻法' },
  even: { technique: 'even', chinese: '平补平泻' },
  neutral: { technique: 'even', chinese: '平补平泻' },
  moxa: { technique: 'moxa', chinese: '灸法' },
  moxibustion: { technique: 'moxa', chinese: '灸法' },
  cupping: { technique: 'cupping', chinese: '拔罐' },
  electroacupuncture: { technique: 'electroacupuncture', chinese: '电针' },
  electro: { technique: 'electroacupuncture', chinese: '电针' },
  bloodletting: { technique: 'bloodletting', chinese: '刺血' },
};

// Point ID to meridian ID mapping helper
const POINT_MERIDIAN_MAP: Record<string, string> = {
  LU: 'lung', LI: 'large-intestine', ST: 'stomach', SP: 'spleen',
  HT: 'heart', SI: 'small-intestine', BL: 'bladder', KI: 'kidney',
  PC: 'pericardium', SJ: 'san-jiao', GB: 'gallbladder', LR: 'liver',
  GV: 'du-mai', DU: 'du-mai', CV: 'ren-mai', REN: 'ren-mai',
};

function getPointMeridian(pointId: string): string {
  const prefix = pointId.replace(/-?\d+$/, '').replace(/-$/, '');
  return POINT_MERIDIAN_MAP[prefix.toUpperCase()] || 'unknown';
}

/**
 * POST /api/post-consultation
 * Trigger AI enrichment and email sending for a completed consultation
 */
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
      treatment_id,
      clinical_note_id,
      appointment_id,
    } = body;

    if (!practice_id || !patient_id) {
      return NextResponse.json(
        { error: 'practice_id and patient_id are required' },
        { status: 400 }
      );
    }

    // Fetch patient
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patient_id)
      .eq('practice_id', practice_id)
      .single();

    if (patientError || !patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Fetch practice
    const { data: practice } = await supabase
      .from('practices')
      .select('*')
      .eq('id', practice_id)
      .single();

    // Fetch practitioner profile
    const { data: practitioner } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Fetch treatment record
    let treatment = null;
    if (treatment_id) {
      const { data } = await supabase
        .from('treatment_records')
        .select('*')
        .eq('id', treatment_id)
        .single();
      treatment = data;
    }

    // Fetch clinical note
    let clinicalNote = null;
    if (clinical_note_id) {
      const { data } = await supabase
        .from('clinical_notes')
        .select('*')
        .eq('id', clinical_note_id)
        .single();
      clinicalNote = data;
    }

    // Fetch latest consultation recording/transcription
    let transcription = null;
    if (appointment_id) {
      const { data } = await supabase
        .from('consultation_recordings')
        .select('*')
        .eq('appointment_id', appointment_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      transcription = data;
    }

    // Fetch next appointment
    let nextAppointment = null;
    {
      const { data } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patient_id)
        .eq('practice_id', practice_id)
        .in('status', ['scheduled', 'confirmed'])
        .gt('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(1)
        .single();
      nextAppointment = data;
    }

    // ============ AI ENRICHMENT ============

    const aiPrompt = buildAIPrompt(
      patient,
      clinicalNote,
      treatment,
      transcription
    );

    const aiResult = await callOpenAI(aiPrompt);

    // Build treated points from treatment record
    const treatedPoints: TreatedPoint[] = (treatment?.acupuncture_points || []).map(
      (pt: { point: string; technique?: string; retention_time?: number; sensation?: string }) => {
        const tech = TECHNIQUE_MAP[(pt.technique || 'even').toLowerCase()] || TECHNIQUE_MAP.even;
        return {
          point_id: pt.point,
          meridian_id: getPointMeridian(pt.point),
          technique: tech.technique,
          technique_chinese: tech.chinese,
          retention_time: pt.retention_time,
          sensation: pt.sensation,
          therapeutic_purpose: '',
        };
      }
    );

    // Build pathology state from AI analysis
    const pathologyState: PathologyState = {
      primary_pattern: aiResult.primary_pattern || clinicalNote?.pattern_diagnosis || '',
      secondary_patterns: aiResult.secondary_patterns || [],
      affected_organs: aiResult.affected_organs || [],
      pathology_type: (aiResult.pathology_types || ['stagnation']) as PathologyType[],
      description: aiResult.pathology_description || '',
    };

    // Build visualization data
    const visualizationData = buildVisualizationData(pathologyState, treatedPoints);

    // ============ SAVE TO DATABASE ============

    const { data: result, error: insertError } = await supabase
      .from('post_consultation_results')
      .insert({
        practice_id,
        patient_id,
        practitioner_id: user.id,
        treatment_id,
        clinical_note_id,
        appointment_id,
        ai_summary: aiResult.summary_html || '',
        ai_summary_plain: aiResult.summary_plain || '',
        research_enrichment: aiResult.research_enrichment || [],
        classical_references: aiResult.classical_references || [],
        lifestyle_recommendations: aiResult.lifestyle_recommendations || {},
        dietary_therapy: aiResult.dietary_therapy || {},
        visualization_data: visualizationData,
        treated_points: treatedPoints,
        pathology_state: pathologyState,
        patient_gender: patient.gender || 'neutral',
        treatment_date: treatment?.treatment_date || new Date().toISOString().split('T')[0],
        next_appointment: nextAppointment?.start_time || null,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // ============ SEND EMAIL ============

    if (patient.email) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || '';
      const visualizationUrl = `${baseUrl}/results/${result.access_token}`;

      const emailHtml = generateEmailHtml(
        result,
        `${patient.first_name} ${patient.last_name}`,
        practitioner?.full_name || 'Your Practitioner',
        practice?.name || 'Your Practice',
        visualizationUrl
      );

      try {
        const resend = new Resend(process.env.RESEND_API_KEY);

        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || `${practice?.name || 'Consult Results'} <noreply@${process.env.RESEND_DOMAIN || 'updates.consultresults.com'}>`,
          to: patient.email,
          subject: `Your Treatment Summary — ${new Date(result.treatment_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}`,
          html: emailHtml,
        });

        // Update email status
        await supabase
          .from('post_consultation_results')
          .update({
            email_sent_at: new Date().toISOString(),
            email_status: 'sent',
          })
          .eq('id', result.id);

        result.email_status = 'sent';
        result.email_sent_at = new Date().toISOString();
      } catch (emailErr) {
        console.error('Email send failed:', emailErr);

        await supabase
          .from('post_consultation_results')
          .update({ email_status: 'failed' })
          .eq('id', result.id);

        result.email_status = 'failed';
      }
    }

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error('Post-consultation error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/post-consultation?practice_id=...&patient_id=...
 * Fetch post-consultation results
 */
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

    if (!practice_id) {
      return NextResponse.json({ error: 'practice_id is required' }, { status: 400 });
    }

    let query = supabase
      .from('post_consultation_results')
      .select('*, patient:patients(*)')
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

// ============================================================
// AI PROMPT BUILDER
// ============================================================

function buildAIPrompt(
  patient: Record<string, unknown>,
  clinicalNote: Record<string, unknown> | null,
  treatment: Record<string, unknown> | null,
  transcription: Record<string, unknown> | null
): string {
  let context = `Patient: ${patient.first_name} ${patient.last_name}`;
  if (patient.gender) context += `, Gender: ${patient.gender}`;
  if (patient.date_of_birth) context += `, DOB: ${patient.date_of_birth}`;
  if (patient.chief_complaint) context += `\nChief Complaint: ${patient.chief_complaint}`;
  if (patient.medical_history) context += `\nMedical History: ${patient.medical_history}`;

  if (clinicalNote) {
    context += '\n\n--- CLINICAL NOTES (SOAP) ---';
    if (clinicalNote.subjective) context += `\nSubjective: ${clinicalNote.subjective}`;
    if (clinicalNote.objective) context += `\nObjective: ${clinicalNote.objective}`;
    if (clinicalNote.assessment) context += `\nAssessment: ${clinicalNote.assessment}`;
    if (clinicalNote.plan) context += `\nPlan: ${clinicalNote.plan}`;
    if (clinicalNote.tongue_notes) context += `\nTongue: ${clinicalNote.tongue_notes}`;
    if (clinicalNote.pulse_notes) context += `\nPulse: ${clinicalNote.pulse_notes}`;
    if (clinicalNote.pattern_diagnosis) context += `\nPattern Diagnosis: ${clinicalNote.pattern_diagnosis}`;
  }

  if (treatment) {
    context += '\n\n--- TREATMENT RECORD ---';
    context += `\nAcupuncture Points: ${JSON.stringify(treatment.acupuncture_points)}`;
    if (treatment.needle_technique) context += `\nNeedle Technique: ${treatment.needle_technique}`;
    if (treatment.retention_time) context += `\nRetention Time: ${treatment.retention_time} min`;
    if (treatment.moxa_applied) context += `\nMoxa: ${treatment.moxa_details || 'Applied'}`;
    if (treatment.cupping_applied) context += `\nCupping: ${treatment.cupping_details || 'Applied'}`;
    if (treatment.tuina_applied) context += `\nTui Na: ${treatment.tuina_details || 'Applied'}`;
    if (treatment.electroacupuncture) context += `\nElectroacupuncture: ${treatment.electroacupuncture_details || 'Applied'}`;
    if (treatment.gua_sha) context += `\nGua Sha: ${treatment.gua_sha_details || 'Applied'}`;
    if (treatment.dietary_advice) context += `\nDietary Advice: ${treatment.dietary_advice}`;
    if (treatment.lifestyle_notes) context += `\nLifestyle Notes: ${treatment.lifestyle_notes}`;
  }

  if (transcription) {
    context += '\n\n--- CONSULTATION TRANSCRIPTION ---';
    if (transcription.transcription_text) context += `\n${transcription.transcription_text}`;
    if (transcription.soap_extraction) context += `\nSOAP Extraction: ${JSON.stringify(transcription.soap_extraction)}`;
  }

  return context;
}

// ============================================================
// OPENAI INTEGRATION
// ============================================================

async function callOpenAI(patientContext: string) {
  const systemPrompt = `You are an expert Traditional Chinese Medicine (TCM) practitioner and researcher creating a post-treatment summary for a patient. You bridge classical TCM wisdom with modern medical understanding.

Your task: Analyse the treatment data and produce a comprehensive, patient-friendly summary with classical text references and lifestyle recommendations.

Respond in JSON format with these fields:
{
  "summary_html": "HTML-formatted treatment summary for the patient (use <p>, <strong>, <em> tags only)",
  "summary_plain": "Plain text version of the summary (2-4 paragraphs, patient-friendly language)",
  "primary_pattern": "Primary TCM pattern diagnosis (e.g., 'Liver Qi Stagnation')",
  "secondary_patterns": ["Array of secondary patterns"],
  "affected_organs": ["Array of affected organs in English (e.g., 'liver', 'spleen')"],
  "pathology_types": ["Array of pathology types: stagnation, deficiency, excess, heat, cold, dampness, phlegm, wind"],
  "pathology_description": "Brief description of the energetic imbalance",
  "research_enrichment": [
    {
      "topic": "Topic name",
      "modern_research": "Brief summary of relevant modern research",
      "classical_basis": "Classical TCM understanding",
      "source": "Source reference"
    }
  ],
  "classical_references": [
    {
      "text_name": "Name of classical text (English)",
      "text_chinese": "Chinese name of text",
      "chapter": "Chapter name/number if known",
      "passage": "Relevant passage or quote (English translation)",
      "relevance": "Why this passage is relevant to this treatment"
    }
  ],
  "lifestyle_recommendations": {
    "diet": ["Dietary advice specific to the pattern"],
    "exercise": ["Exercise recommendations"],
    "sleep": ["Sleep hygiene tips"],
    "emotional": ["Emotional wellness advice based on Five Element theory"],
    "seasonal": ["Seasonal living advice"],
    "general": ["General lifestyle tips"]
  },
  "dietary_therapy": {
    "beneficial_foods": [
      {
        "food": "Food name",
        "nature": "warm/cool/neutral/hot/cold",
        "flavour": "sweet/sour/bitter/pungent/salty",
        "organ_affinity": ["organs"],
        "therapeutic_action": "What it does"
      }
    ],
    "foods_to_avoid": [same format],
    "tea_recommendations": ["Tea suggestions"],
    "cooking_methods": ["Recommended cooking methods"],
    "meal_timing": ["Meal timing advice"]
  }
}

IMPORTANT:
- Write the patient summary in warm, accessible language — avoid jargon
- Include 2-4 research enrichment items
- Include 2-3 classical text references (use REAL passages from Huang Di Nei Jing, Shang Han Lun, etc.)
- Provide 3-5 items per lifestyle category
- Provide 5-8 beneficial foods and 3-5 foods to avoid with TCM food energetics
- Ensure all classical references are real, well-known passages
- Base all recommendations on the specific pattern diagnosis`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: patientContext },
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, await response.text());
      return getDefaultAIResult();
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) return getDefaultAIResult();

    try {
      return JSON.parse(content);
    } catch {
      // Try extracting JSON from the response
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
      return getDefaultAIResult();
    }
  } catch (err) {
    console.error('OpenAI call failed:', err);
    return getDefaultAIResult();
  }
}

function getDefaultAIResult() {
  return {
    summary_html: '<p>Your treatment session has been completed. Please consult your practitioner for detailed information.</p>',
    summary_plain: 'Your treatment session has been completed. Please consult your practitioner for detailed information about your treatment plan and any lifestyle adjustments that may benefit your health.',
    primary_pattern: 'General treatment',
    secondary_patterns: [],
    affected_organs: [],
    pathology_types: ['stagnation'],
    pathology_description: 'Treatment administered to support overall health and balance.',
    research_enrichment: [],
    classical_references: [],
    lifestyle_recommendations: {
      diet: ['Eat warm, cooked foods', 'Drink plenty of warm water'],
      exercise: ['Gentle walking for 20-30 minutes daily'],
      sleep: ['Aim for 7-8 hours of sleep'],
      emotional: ['Practice deep breathing when feeling stressed'],
      seasonal: ['Adjust your activities to the current season'],
      general: ['Allow yourself rest after treatment'],
    },
    dietary_therapy: {
      beneficial_foods: [],
      foods_to_avoid: [],
      tea_recommendations: ['Warm ginger tea'],
      cooking_methods: ['Steaming', 'Slow cooking'],
      meal_timing: ['Eat your largest meal at midday'],
    },
  };
}
