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

async function analyzeWithOpenAI(imageData: string): Promise<{ analysis: string; patterns: string[] }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      analysis: 'OpenAI API key not configured. Manual analysis required.',
      patterns: [],
    };
  }

  try {
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
            content: `You are an expert Traditional Chinese Medicine (TCM) tongue diagnostician. Analyze the tongue image and provide a structured TCM tongue diagnosis. Include: body color, body shape, coating color, coating thickness, moisture level, sublingual veins, and any notable features. Then suggest TCM patterns based on your observations. Return your response as JSON with the following structure:
{
  "body_color": "string",
  "body_shape": "string",
  "coating_color": "string",
  "coating_thickness": "string",
  "moisture": "string",
  "sublingual_veins": "string",
  "spirit": "string",
  "analysis": "detailed text analysis",
  "patterns": ["array of TCM pattern suggestions"]
}`,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this tongue image according to TCM diagnostic principles.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageData.startsWith('data:') ? imageData : `data:image/jpeg;base64,${imageData}`,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || '';

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          analysis: parsed.analysis || content,
          patterns: parsed.patterns || [],
        };
      }
    } catch {
      // If JSON parsing fails, return raw text
    }

    return { analysis: content, patterns: [] };
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    return {
      analysis: 'AI analysis temporarily unavailable. Please provide manual assessment.',
      patterns: [],
    };
  }
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

    let query = supabase
      .from('tongue_analyses')
      .select('*')
      .order('created_at', { ascending: false });

    if (patient_id) {
      query = query.eq('patient_id', patient_id);
    }
    if (practice_id) {
      query = query.eq('practice_id', practice_id);
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
    const { image_data, ...restBody } = body;

    let aiResult = { analysis: '', patterns: [] as string[] };
    if (image_data) {
      aiResult = await analyzeWithOpenAI(image_data);
    }

    const { data, error } = await supabase
      .from('tongue_analyses')
      .insert({
        ...restBody,
        submitted_by: user.id,
        ai_analysis: aiResult.analysis || restBody.ai_analysis,
        ai_patterns: aiResult.patterns.length > 0 ? aiResult.patterns : (restBody.ai_patterns || []),
        regions: restBody.regions || {},
        is_self_assessment: restBody.is_self_assessment ?? false,
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
