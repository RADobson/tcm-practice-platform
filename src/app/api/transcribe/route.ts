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

async function transcribeAudio(audioBuffer: Buffer, filename: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OpenAI API key not configured');

  const formData = new FormData();
  formData.append('file', new Blob([new Uint8Array(audioBuffer)]), filename);
  formData.append('model', 'whisper-1');
  formData.append('language', 'en');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}` },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Whisper API error: ${response.statusText}`);
  }

  const result = await response.json();
  return result.text;
}

async function extractSOAPNotes(transcript: string): Promise<Record<string, string>> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OpenAI API key not configured');

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
          content: `You are an expert TCM (Traditional Chinese Medicine) clinical note transcriber. Given a consultation transcript, extract structured SOAP notes appropriate for a TCM practice.

Return valid JSON with exactly this structure:
{
  "subjective": "Patient's reported symptoms, complaints, and history in their own words. Include onset, duration, aggravating/alleviating factors, associated symptoms.",
  "objective": "Objective clinical findings mentioned: tongue appearance (color, coating, shape, moisture), pulse qualities (rate, depth, strength, quality at each position), palpation findings, observation of complexion, voice, posture, any physical exam findings.",
  "assessment": "TCM pattern differentiation based on findings. Include primary pattern, any secondary patterns. Reference Zang-Fu theory, Eight Principles, Qi/Blood/Fluid pathology as appropriate.",
  "plan": "Treatment plan discussed: acupuncture points mentioned, herbal formulas, dietary advice, lifestyle modifications, follow-up schedule, any referrals."
}

Extract information faithfully from the transcript. If a SOAP section has no relevant content in the transcript, write "Not discussed in this consultation."`,
        },
        {
          role: 'user',
          content: `Please extract SOAP notes from this TCM consultation transcript:\n\n${transcript}`,
        },
      ],
      max_tokens: 2000,
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    throw new Error(`GPT API error: ${response.statusText}`);
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content || '';

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  return {
    subjective: content,
    objective: 'Not discussed in this consultation.',
    assessment: 'Not discussed in this consultation.',
    plan: 'Not discussed in this consultation.',
  };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;
    const patient_id = formData.get('patient_id') as string;
    const practice_id = formData.get('practice_id') as string;
    const appointment_id = formData.get('appointment_id') as string | null;

    if (!audioFile) {
      return NextResponse.json({ error: 'Audio file is required' }, { status: 400 });
    }

    if (!patient_id || !practice_id) {
      return NextResponse.json({ error: 'patient_id and practice_id are required' }, { status: 400 });
    }

    // Upload audio to Supabase Storage
    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);
    const ext = audioFile.name?.split('.').pop() || 'webm';
    const storagePath = `${practice_id}/${patient_id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('consultation-audio')
      .upload(storagePath, audioBuffer, {
        contentType: audioFile.type || 'audio/webm',
      });

    let audioUrl = '';
    if (!uploadError) {
      const { data: urlData } = supabase.storage
        .from('consultation-audio')
        .getPublicUrl(storagePath);
      audioUrl = urlData.publicUrl;
    }

    // Transcribe with Whisper
    const transcript = await transcribeAudio(audioBuffer, `recording.${ext}`);

    // Extract SOAP notes
    const soapNotes = await extractSOAPNotes(transcript);

    // Save recording to database
    const { data: recording, error: dbError } = await supabase
      .from('consultation_recordings')
      .insert({
        practice_id,
        patient_id,
        practitioner_id: user.id,
        appointment_id: appointment_id || null,
        audio_url: audioUrl,
        duration_seconds: null,
        transcript,
        soap_notes: soapNotes,
        status: 'completed',
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({
      recording,
      transcript,
      soap_notes: soapNotes,
    }, { status: 201 });
  } catch (err) {
    console.error('Transcription error:', err);
    return NextResponse.json({ error: 'Failed to process audio' }, { status: 500 });
  }
}
