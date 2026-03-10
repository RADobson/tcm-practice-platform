'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import Link from 'next/link';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns';

interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  weekAppointments: number;
  pendingInvoices: number;
  unreadMessages: number;
  recentPatients: any[];
  upcomingAppointments: any[];
}

export default function DashboardOverview() {
  const { practice } = useAppStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayAppointments: 0,
    weekAppointments: 0,
    pendingInvoices: 0,
    unreadMessages: 0,
    recentPatients: [],
    upcomingAppointments: [],
  });
  const supabase = createClient();

  useEffect(() => {
    if (!practice) return;

    async function loadStats() {
      const now = new Date();
      const todayStart = startOfDay(now).toISOString();
      const todayEnd = endOfDay(now).toISOString();
      const weekStart = startOfWeek(now).toISOString();
      const weekEnd = endOfWeek(now).toISOString();

      const [patients, todayAppts, weekAppts, invoices, messages, recentPats, upcoming] = await Promise.all([
        supabase.from('patients').select('id', { count: 'exact', head: true }).eq('practice_id', practice!.id).eq('is_active', true),
        supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('practice_id', practice!.id).gte('start_time', todayStart).lte('start_time', todayEnd),
        supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('practice_id', practice!.id).gte('start_time', weekStart).lte('start_time', weekEnd),
        supabase.from('invoices').select('id', { count: 'exact', head: true }).eq('practice_id', practice!.id).in('status', ['sent', 'overdue']),
        supabase.from('messages').select('id', { count: 'exact', head: true }).eq('practice_id', practice!.id).eq('is_read', false),
        supabase.from('patients').select('*').eq('practice_id', practice!.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('appointments').select('*, patient:patients(first_name, last_name)').eq('practice_id', practice!.id).gte('start_time', todayStart).order('start_time').limit(8),
      ]);

      setStats({
        totalPatients: patients.count || 0,
        todayAppointments: todayAppts.count || 0,
        weekAppointments: weekAppts.count || 0,
        pendingInvoices: invoices.count || 0,
        unreadMessages: messages.count || 0,
        recentPatients: recentPats.data || [],
        upcomingAppointments: upcoming.data || [],
      });
    }
    loadStats();
  }, [practice, supabase]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="stat-card">
          <div className="stat-value">{stats.totalPatients}</div>
          <div className="stat-label">Active Patients</div>
        </div>
        <div className="stat-card">
          <div className="stat-value text-cyan-400">{stats.todayAppointments}</div>
          <div className="stat-label">Today&apos;s Appointments</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.weekAppointments}</div>
          <div className="stat-label">This Week</div>
        </div>
        <div className="stat-card">
          <div className="stat-value text-amber-400">{stats.pendingInvoices}</div>
          <div className="stat-label">Pending Invoices</div>
        </div>
        <div className="stat-card">
          <div className="stat-value text-cyan-400">{stats.unreadMessages}</div>
          <div className="stat-label">Unread Messages</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Upcoming Appointments</h2>
            <Link href="/dashboard/appointments" className="text-sm text-earth-300 hover:text-earth-200">
              View All
            </Link>
          </div>
          {stats.upcomingAppointments.length === 0 ? (
            <p className="text-gray-500 text-sm">No upcoming appointments today</p>
          ) : (
            <div className="space-y-3">
              {stats.upcomingAppointments.map((appt: any) => (
                <div key={appt.id} className="flex items-center justify-between py-2 border-b border-dark-50 last:border-0">
                  <div>
                    <div className="text-sm text-white">
                      {appt.patient?.first_name} {appt.patient?.last_name}
                    </div>
                    <div className="text-xs text-gray-500">{appt.type}</div>
                  </div>
                  <div className="text-sm text-gray-400">
                    {format(new Date(appt.start_time), 'h:mm a')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Patients */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Patients</h2>
            <Link href="/dashboard/patients" className="text-sm text-earth-300 hover:text-earth-200">
              View All
            </Link>
          </div>
          {stats.recentPatients.length === 0 ? (
            <p className="text-gray-500 text-sm">No patients yet. Add your first patient to get started.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentPatients.map((patient: any) => (
                <Link
                  key={patient.id}
                  href={`/dashboard/patients/${patient.id}`}
                  className="flex items-center justify-between py-2 border-b border-dark-50 last:border-0 hover:bg-dark-300/50 -mx-2 px-2 rounded"
                >
                  <div>
                    <div className="text-sm text-white">
                      {patient.first_name} {patient.last_name}
                    </div>
                    <div className="text-xs text-gray-500">{patient.chief_complaint || 'No complaint listed'}</div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {format(new Date(patient.created_at), 'MMM d')}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: '/dashboard/patients?new=1', label: 'New Patient', icon: '⊕' },
            { href: '/dashboard/appointments?new=1', label: 'New Appointment', icon: '◷' },
            { href: '/dashboard/notes?new=1', label: 'New SOAP Note', icon: '✎' },
            { href: '/dashboard/billing?new=1', label: 'New Invoice', icon: '⊡' },
          ].map((action) => (
            <Link key={action.href} href={action.href} className="card-hover text-center py-4">
              <div className="text-2xl mb-2">{action.icon}</div>
              <div className="text-sm text-gray-300">{action.label}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
