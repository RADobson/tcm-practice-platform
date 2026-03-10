'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { format } from 'date-fns';
import type { Appointment } from '@/lib/types';

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    scheduled: 'badge-earth',
    confirmed: 'badge-cyan',
    in_progress: 'badge-warning',
    completed: 'badge-success',
    cancelled: 'badge-danger',
    no_show: 'badge-danger',
  };

  const labels: Record<string, string> = {
    scheduled: 'Scheduled',
    confirmed: 'Confirmed',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    no_show: 'No Show',
  };

  return (
    <span className={styles[status] || 'badge-earth'}>
      {labels[status] || status}
    </span>
  );
}

export default function PortalAppointments() {
  const { profile } = useAppStore();
  const supabase = createClient();

  const [upcoming, setUpcoming] = useState<Appointment[]>([]);
  const [past, setPast] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    if (!profile) return;
    loadAppointments();
  }, [profile]);

  async function loadAppointments() {
    if (!profile) return;

    try {
      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', profile.id)
        .single();

      if (!patient) {
        setLoading(false);
        return;
      }

      const now = new Date().toISOString();

      // Upcoming
      const { data: upcomingData } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patient.id)
        .in('status', ['scheduled', 'confirmed'])
        .gte('start_time', now)
        .order('start_time', { ascending: true });

      setUpcoming(upcomingData || []);

      // Past
      const { data: pastData } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patient.id)
        .or(`start_time.lt.${now},status.in.(completed,cancelled,no_show)`)
        .order('start_time', { ascending: false })
        .limit(50);

      setPast(pastData || []);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-earth-300/30 border-t-earth-300 rounded-full animate-spin" />
          <span className="text-sm text-gray-400">Loading appointments...</span>
        </div>
      </div>
    );
  }

  const currentList = activeTab === 'upcoming' ? upcoming : past;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Appointments</h1>

      {/* Tab switcher */}
      <div className="flex bg-dark-400 rounded-xl p-1 border border-dark-50">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'upcoming'
              ? 'bg-earth-300/20 text-earth-300'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Upcoming ({upcoming.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'past'
              ? 'bg-earth-300/20 text-earth-300'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Past ({past.length})
        </button>
      </div>

      {/* List */}
      {currentList.length === 0 ? (
        <div className="portal-card text-center py-12">
          <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <p className="text-gray-400 text-sm">
            {activeTab === 'upcoming'
              ? 'No upcoming appointments'
              : 'No past appointments'}
          </p>
          {activeTab === 'upcoming' && (
            <p className="text-gray-500 text-xs mt-1">
              Contact your practitioner to schedule a visit.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {currentList.map((appt) => (
            <div key={appt.id} className="portal-card">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {format(new Date(appt.start_time), 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {format(new Date(appt.start_time), 'h:mm a')} &ndash;{' '}
                    {format(new Date(appt.end_time), 'h:mm a')}
                  </p>
                </div>
                <StatusBadge status={appt.status} />
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="badge-earth">{appt.type}</span>
                {appt.chief_complaint && (
                  <span className="text-xs text-gray-500 truncate">
                    {appt.chief_complaint}
                  </span>
                )}
              </div>
              {appt.notes && (
                <p className="text-xs text-gray-500 mt-2 line-clamp-2">{appt.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
