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
    const practice_id = searchParams.get('practice_id');
    const status = searchParams.get('status');
    const patient_id = searchParams.get('patient_id');

    if (!practice_id) {
      return NextResponse.json({ error: 'practice_id is required' }, { status: 400 });
    }

    let query = supabase
      .from('invoices')
      .select('*, patient:patients(first_name, last_name, email)')
      .eq('practice_id', practice_id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }
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
    const { practice_id, patient_id, items } = body;

    if (!practice_id || !patient_id) {
      return NextResponse.json(
        { error: 'practice_id and patient_id are required' },
        { status: 400 }
      );
    }

    const invoiceItems = items || [];
    const subtotal = invoiceItems.reduce(
      (sum: number, item: { amount: number }) => sum + (item.amount || 0),
      0
    );
    const taxRate = body.tax_rate || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const discount = body.discount || 0;
    const total = subtotal + taxAmount - discount;

    const { data, error } = await supabase
      .from('invoices')
      .insert({
        practice_id,
        patient_id,
        invoice_number: body.invoice_number || `INV-${Date.now()}`,
        status: body.status || 'draft',
        issue_date: body.issue_date || new Date().toISOString().split('T')[0],
        due_date: body.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        discount,
        total,
        amount_paid: body.amount_paid || 0,
        notes: body.notes,
        items: invoiceItems,
        payment_history: body.payment_history || [],
      })
      .select('*, patient:patients(first_name, last_name, email)')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
