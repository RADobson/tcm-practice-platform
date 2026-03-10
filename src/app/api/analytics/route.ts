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
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');

    if (!practice_id) {
      return NextResponse.json({ error: 'practice_id is required' }, { status: 400 });
    }

    // Fetch patients count
    const { count: totalPatients } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('practice_id', practice_id)
      .eq('is_active', true);

    // Fetch appointments for the period
    let appointmentsQuery = supabase
      .from('appointments')
      .select('*')
      .eq('practice_id', practice_id);

    if (start_date) {
      appointmentsQuery = appointmentsQuery.gte('start_time', start_date);
    }
    if (end_date) {
      appointmentsQuery = appointmentsQuery.lte('start_time', end_date);
    }

    const { data: appointments } = await appointmentsQuery;

    // Fetch invoices for the period
    let invoicesQuery = supabase
      .from('invoices')
      .select('*')
      .eq('practice_id', practice_id);

    if (start_date) {
      invoicesQuery = invoicesQuery.gte('issue_date', start_date);
    }
    if (end_date) {
      invoicesQuery = invoicesQuery.lte('issue_date', end_date);
    }

    const { data: invoices } = await invoicesQuery;

    // Fetch clinical notes for common presentations
    let notesQuery = supabase
      .from('clinical_notes')
      .select('chief_complaint:subjective, pattern_diagnosis')
      .eq('practice_id', practice_id);

    if (start_date) {
      notesQuery = notesQuery.gte('visit_date', start_date);
    }
    if (end_date) {
      notesQuery = notesQuery.lte('visit_date', end_date);
    }

    const { data: notes } = await notesQuery;

    // Fetch all patients to determine new vs returning
    const { data: allPatients } = await supabase
      .from('patients')
      .select('id, created_at')
      .eq('practice_id', practice_id)
      .eq('is_active', true);

    // Calculate stats
    const appointmentsList = appointments || [];
    const invoicesList = invoices || [];
    const notesList = notes || [];

    const totalAppointments = appointmentsList.length;
    const completedAppointments = appointmentsList.filter(
      (a) => a.status === 'completed'
    ).length;

    const totalRevenue = invoicesList.reduce(
      (sum, inv) => sum + (inv.amount_paid || 0),
      0
    );
    const avgPerVisit = completedAppointments > 0 ? totalRevenue / completedAppointments : 0;

    // Appointments by type
    const appointmentsByType: Record<string, number> = {};
    appointmentsList.forEach((a) => {
      const type = a.type || 'Other';
      appointmentsByType[type] = (appointmentsByType[type] || 0) + 1;
    });

    // Appointments by day of week
    const appointmentsByDay: Record<string, number> = {
      Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0,
    };
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    appointmentsList.forEach((a) => {
      const day = dayNames[new Date(a.start_time).getDay()];
      appointmentsByDay[day]++;
    });

    // Appointments by hour
    const appointmentsByHour: Record<string, number> = {};
    for (let h = 7; h <= 20; h++) {
      appointmentsByHour[`${h}:00`] = 0;
    }
    appointmentsList.forEach((a) => {
      const hour = new Date(a.start_time).getHours();
      const key = `${hour}:00`;
      if (appointmentsByHour[key] !== undefined) {
        appointmentsByHour[key]++;
      }
    });

    // Revenue by month
    const revenueByMonth: Record<string, number> = {};
    invoicesList.forEach((inv) => {
      const month = inv.issue_date?.substring(0, 7) || 'Unknown';
      revenueByMonth[month] = (revenueByMonth[month] || 0) + (inv.amount_paid || 0);
    });

    // Common presentations (chief complaints from notes' subjective field)
    const complaintCounts: Record<string, number> = {};
    appointmentsList.forEach((a) => {
      if (a.chief_complaint) {
        const complaint = a.chief_complaint.trim();
        complaintCounts[complaint] = (complaintCounts[complaint] || 0) + 1;
      }
    });

    const commonComplaints = Object.entries(complaintCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([complaint, count]) => ({ complaint, count }));

    // Common pattern diagnoses
    const patternCounts: Record<string, number> = {};
    notesList.forEach((n: Record<string, unknown>) => {
      const pd = n.pattern_diagnosis as string | undefined;
      if (pd) {
        pd.split(',').forEach((p: string) => {
          const pattern = p.trim();
          if (pattern) {
            patternCounts[pattern] = (patternCounts[pattern] || 0) + 1;
          }
        });
      }
    });

    const commonPatterns = Object.entries(patternCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([pattern, count]) => ({ pattern, count }));

    // New vs returning patients
    let newPatients = 0;
    let returningPatients = 0;
    if (allPatients && start_date) {
      allPatients.forEach((p) => {
        if (p.created_at >= start_date) {
          newPatients++;
        } else {
          returningPatients++;
        }
      });
    } else {
      newPatients = allPatients?.length || 0;
    }

    // Appointment volume by date
    const volumeByDate: Record<string, number> = {};
    appointmentsList.forEach((a) => {
      const date = a.start_time?.substring(0, 10);
      if (date) {
        volumeByDate[date] = (volumeByDate[date] || 0) + 1;
      }
    });

    return NextResponse.json({
      totalPatients: totalPatients || 0,
      totalAppointments,
      completedAppointments,
      totalRevenue,
      avgPerVisit,
      appointmentsByType,
      appointmentsByDay,
      appointmentsByHour,
      revenueByMonth,
      commonComplaints,
      commonPatterns,
      newPatients,
      returningPatients,
      volumeByDate,
    });
  } catch (e) {
    console.error('Analytics error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
