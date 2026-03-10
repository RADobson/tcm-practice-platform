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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Handle payment recording
    if (body.record_payment) {
      const { data: invoice, error: fetchError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', params.id)
        .single();

      if (fetchError || !invoice) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }

      const payment = {
        date: new Date().toISOString().split('T')[0],
        amount: body.record_payment.amount,
        method: body.record_payment.method,
        reference: body.record_payment.reference,
      };

      const updatedHistory = [...(invoice.payment_history || []), payment];
      const newAmountPaid = (invoice.amount_paid || 0) + payment.amount;
      const newStatus = newAmountPaid >= invoice.total ? 'paid' : invoice.status;

      const { data, error } = await supabase
        .from('invoices')
        .update({
          payment_history: updatedHistory,
          amount_paid: newAmountPaid,
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.id)
        .select('*, patient:patients(first_name, last_name, email)')
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data);
    }

    // Standard update (status change, etc.)
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.status) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.items) {
      updateData.items = body.items;
      const subtotal = body.items.reduce(
        (sum: number, item: { amount: number }) => sum + (item.amount || 0),
        0
      );
      updateData.subtotal = subtotal;
      if (body.tax_rate !== undefined) {
        updateData.tax_rate = body.tax_rate;
        updateData.tax_amount = subtotal * (body.tax_rate / 100);
      }
      if (body.discount !== undefined) updateData.discount = body.discount;
      updateData.total =
        (updateData.subtotal as number) +
        ((updateData.tax_amount as number) || 0) -
        ((updateData.discount as number) || 0);
    }

    const { data, error } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', params.id)
      .select('*, patient:patients(first_name, last_name, email)')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
