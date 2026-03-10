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

async function generateTreatmentPlan(input: {
  pattern_diagnosis: string;
  treatment_principles?: string[];
  patient_info?: string;
}): Promise<Record<string, unknown>> {
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
          content: `You are an expert TCM acupuncturist and treatment planner. Given a confirmed pattern diagnosis, design a comprehensive treatment protocol.

Return valid JSON with this structure:
{
  "treatment_principles": ["List of treatment principles"],
  "acupuncture_protocol": [
    {
      "point": "LI-4 (He Gu)",
      "location": "Anatomical location description",
      "reasoning": "Clinical reasoning for selecting this point",
      "technique": "tonify|sedate|even",
      "needle_depth": "0.5-1 cun",
      "moxa": true|false,
      "moxa_method": "Direct/indirect/stick moxa if applicable"
    }
  ],
  "point_combinations": [
    {
      "name": "Combination name (e.g. Four Gates)",
      "points": ["LI-4", "LR-3"],
      "reasoning": "Why these points work synergistically"
    }
  ],
  "adjunct_therapies": {
    "cupping": {
      "recommended": true|false,
      "locations": ["Where to cup"],
      "method": "stationary|sliding|flash",
      "reasoning": "Why cupping is indicated"
    },
    "gua_sha": {
      "recommended": true|false,
      "areas": ["Where to perform gua sha"],
      "reasoning": "Why gua sha is indicated"
    },
    "ear_seeds": {
      "recommended": true|false,
      "points": [{"name": "Ear point name", "reasoning": "Why"}],
      "duration": "How long to leave them"
    },
    "electroacupuncture": {
      "recommended": true|false,
      "pairs": [{"point1": "x", "point2": "y", "frequency": "2Hz|100Hz", "reasoning": "Why"}]
    }
  },
  "session_plan": {
    "retention_time": 20,
    "frequency": "2x per week for 4 weeks, then reassess",
    "expected_sessions": "8-12 sessions"
  },
  "clinical_reasoning": "Overall explanation of the treatment strategy",
  "cautions": ["Any precautions or contraindications for this protocol"]
}

Use standard point nomenclature (e.g. LI-4, ST-36, SP-6). Include both local and distal points. Consider front-mu and back-shu points for organ patterns.`,
        },
        {
          role: 'user',
          content: `Pattern Diagnosis: ${input.pattern_diagnosis}

${input.treatment_principles ? `Treatment Principles: ${input.treatment_principles.join(', ')}` : ''}

${input.patient_info ? `Additional Patient Info: ${input.patient_info}` : ''}

Please design a comprehensive acupuncture treatment protocol with adjunct therapies.`,
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

  return { clinical_reasoning: content, acupuncture_protocol: [] };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { pattern_diagnosis, treatment_principles, patient_id, practice_id, patient_info, save } = body;

    if (!pattern_diagnosis) {
      return NextResponse.json({ error: 'Pattern diagnosis is required' }, { status: 400 });
    }

    const aiResult = await generateTreatmentPlan({
      pattern_diagnosis,
      treatment_principles,
      patient_info,
    });

    if (save && practice_id && patient_id) {
      const typedResult = aiResult as {
        treatment_principles?: string[];
        acupuncture_protocol?: unknown[];
        point_combinations?: unknown[];
        adjunct_therapies?: unknown;
        clinical_reasoning?: string;
      };

      const { data, error } = await supabase
        .from('ai_treatment_plans')
        .insert({
          practice_id,
          patient_id,
          practitioner_id: user.id,
          pattern_diagnosis,
          treatment_principles: typedResult.treatment_principles || [],
          acupuncture_protocol: typedResult.acupuncture_protocol || [],
          point_combinations: typedResult.point_combinations || [],
          adjunct_therapies: typedResult.adjunct_therapies || {},
          ai_reasoning: typedResult.clinical_reasoning,
          status: 'draft',
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ ...aiResult, saved_plan: data }, { status: 201 });
    }

    return NextResponse.json(aiResult);
  } catch (err) {
    console.error('Treatment plan error:', err);
    return NextResponse.json({ error: 'Failed to generate treatment plan' }, { status: 500 });
  }
}
