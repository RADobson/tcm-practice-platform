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

async function generateHerbalPrescription(input: {
  pattern_diagnosis: string;
  symptoms: string[];
  contraindications: string[];
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
          content: `You are an expert TCM (Traditional Chinese Medicine) herbalist with deep knowledge of classical formulas and materia medica. Given a pattern diagnosis, symptoms, and contraindications, suggest an appropriate herbal prescription.

Your response must be valid JSON with this structure:
{
  "base_formula": {
    "name": "Pin Yin name",
    "english_name": "English translation",
    "source_text": "Classical source (e.g. Shang Han Lun)",
    "original_actions": "What the base formula traditionally treats"
  },
  "herbs": [
    {
      "pin_yin": "Herb Pin Yin name",
      "english": "English common name",
      "latin": "Botanical Latin name",
      "dosage": 9,
      "unit": "g",
      "role": "jun|chen|zuo|shi",
      "role_label": "Emperor/Minister/Assistant/Envoy",
      "reasoning": "Why this herb is included",
      "is_modification": false
    }
  ],
  "modifications": [
    {
      "action": "add|remove|increase|decrease",
      "herb": "Pin Yin name",
      "reasoning": "Why this modification based on the presentation"
    }
  ],
  "contraindication_warnings": ["List of relevant warnings"],
  "herb_interactions": ["Any notable herb-herb interactions to watch"],
  "pregnancy_warnings": ["Pregnancy-related cautions if any"],
  "preparation_method": "Decoction instructions",
  "dosage_instructions": "How to take the formula",
  "clinical_reasoning": "Overall explanation of formula strategy",
  "treatment_principles": ["List of treatment principles addressed"]
}

Reference classical formulas including but not limited to: Gui Zhi Tang, Si Jun Zi Tang, Liu Wei Di Huang Wan, Xiao Yao San, Bu Zhong Yi Qi Tang, Si Wu Tang, Ba Zhen Tang, Yin Qiao San, Xiao Chai Hu Tang, Long Dan Xie Gan Tang, Tian Wang Bu Xin Dan, Gui Pi Tang, Er Chen Tang, Wen Dan Tang, Zhen Wu Tang, Shen Ling Bai Zhu San, etc.

Always include standard dosage ranges in grams. Flag herbs that are toxic or restricted (e.g. Fu Zi, Ma Huang).`,
        },
        {
          role: 'user',
          content: `Pattern Diagnosis: ${input.pattern_diagnosis}

Symptoms: ${input.symptoms.join(', ')}

Contraindications/Allergies: ${input.contraindications.length > 0 ? input.contraindications.join(', ') : 'None reported'}

${input.patient_info ? `Additional Patient Info: ${input.patient_info}` : ''}

Please suggest an appropriate classical base formula with modifications for this presentation.`,
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

  return { clinical_reasoning: content, herbs: [] };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { pattern_diagnosis, symptoms, contraindications, patient_id, practice_id, patient_info, save } = body;

    if (!pattern_diagnosis) {
      return NextResponse.json({ error: 'Pattern diagnosis is required' }, { status: 400 });
    }

    const aiResult = await generateHerbalPrescription({
      pattern_diagnosis,
      symptoms: symptoms || [],
      contraindications: contraindications || [],
      patient_info,
    });

    if (save && practice_id && patient_id) {
      const { data, error } = await supabase
        .from('herbal_formulas')
        .insert({
          practice_id,
          practitioner_id: user.id,
          patient_id,
          name: (aiResult as { base_formula?: { name?: string } }).base_formula?.name || pattern_diagnosis,
          chinese_name: (aiResult as { base_formula?: { name?: string } }).base_formula?.name,
          source_text: (aiResult as { base_formula?: { source_text?: string } }).base_formula?.source_text,
          category: 'AI Generated',
          actions: (aiResult as { clinical_reasoning?: string }).clinical_reasoning,
          indications: pattern_diagnosis,
          contraindications: ((aiResult as { contraindication_warnings?: string[] }).contraindication_warnings || []).join('; '),
          herbs: (aiResult as { herbs?: unknown[] }).herbs || [],
          modifications: JSON.stringify((aiResult as { modifications?: unknown[] }).modifications || []),
          preparation_method: (aiResult as { preparation_method?: string }).preparation_method,
          dosage_instructions: (aiResult as { dosage_instructions?: string }).dosage_instructions,
          is_template: false,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ ...aiResult, saved_formula: data }, { status: 201 });
    }

    return NextResponse.json(aiResult);
  } catch (err) {
    console.error('Herbal prescription error:', err);
    return NextResponse.json({ error: 'Failed to generate prescription' }, { status: 500 });
  }
}
