'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { format, isToday, isTomorrow, differenceInDays } from 'date-fns';
import Link from 'next/link';
import type { Appointment } from '@/lib/types';

export default function PortalHome() {
  const { profile } = useAppStore();
  const supabase = createClient();

  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [diaryStreak, setDiaryStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    loadDashboardData();
  }, [profile]);

  async function loadDashboardData() {
    if (!profile) return;

    try {
      // Get patient record linked to this user
      const { data: patient } = await supabase
        .from('patients')
        .select('id, practice_id')
        .eq('user_id', profile.id)
        .single();

      if (!patient) {
        setLoading(false);
        return;
      }

      // Fetch next appointment
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patient.id)
        .in('status', ['scheduled', 'confirmed'])
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(1);

      if (appointments && appointments.length > 0) {
        setNextAppointment(appointments[0]);
      }

      // Fetch unread messages
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('patient_id', patient.id)
        .neq('sender_id', profile.id)
        .eq('is_read', false);

      setUnreadMessages(count || 0);

      // Calculate diary streak
      const { data: entries } = await supabase
        .from('symptom_entries')
        .select('entry_date')
        .eq('patient_id', patient.id)
        .order('entry_date', { ascending: false })
        .limit(60);

      if (entries && entries.length > 0) {
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < entries.length; i++) {
          const entryDate = new Date(entries[i].entry_date);
          entryDate.setHours(0, 0, 0, 0);
          const expectedDate = new Date(today);
          expectedDate.setDate(expectedDate.getDate() - i);
          expectedDate.setHours(0, 0, 0, 0);

          if (entryDate.getTime() === expectedDate.getTime()) {
            streak++;
          } else if (i === 0 && differenceInDays(today, entryDate) === 1) {
            // Allow streak to start from yesterday
            streak++;
          } else {
            break;
          }
        }
        setDiaryStreak(streak);
      }
    } catch (err) {
      console.error('Failed to load portal data:', err);
    } finally {
      setLoading(false);
    }
  }

  function formatAppointmentDate(dateStr: string): string {
    const date = new Date(dateStr);
    if (isToday(date)) return `Today at ${format(date, 'h:mm a')}`;
    if (isTomorrow(date)) return `Tomorrow at ${format(date, 'h:mm a')}`;
    return format(date, 'MMM d, yyyy \'at\' h:mm a');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-earth-300/30 border-t-earth-300 rounded-full animate-spin" />
          <span className="text-sm text-gray-400">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}
        </h1>
        <p className="text-gray-400 mt-1">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Next Appointment */}
        <Link href="/portal/appointments" className="portal-card hover:border-earth-300/30 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-earth-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <span className="text-xs text-gray-400 font-medium">Next Visit</span>
          </div>
          {nextAppointment ? (
            <>
              <p className="text-sm font-semibold text-white">
                {formatAppointmentDate(nextAppointment.start_time)}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{nextAppointment.type}</p>
            </>
          ) : (
            <p className="text-sm text-gray-500">No upcoming visits</p>
          )}
        </Link>

        {/* Unread Messages */}
        <Link href="/portal/messages" className="portal-card hover:border-cyan-400/30 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            <span className="text-xs text-gray-400 font-medium">Messages</span>
          </div>
          <p className="text-sm font-semibold text-white">
            {unreadMessages > 0 ? `${unreadMessages} unread` : 'All caught up'}
          </p>
          {unreadMessages > 0 && (
            <div className="w-2 h-2 rounded-full bg-cyan-400 absolute top-3 right-3 animate-pulse" />
          )}
        </Link>

        {/* Diary Streak */}
        <Link href="/portal/diary" className="portal-card hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
            </svg>
            <span className="text-xs text-gray-400 font-medium">Diary Streak</span>
          </div>
          <p className="text-sm font-semibold text-white">
            {diaryStreak > 0 ? `${diaryStreak} day${diaryStreak !== 1 ? 's' : ''}` : 'Start today!'}
          </p>
        </Link>

        {/* Quick Health */}
        <div className="portal-card">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
            <span className="text-xs text-gray-400 font-medium">Wellness</span>
          </div>
          <p className="text-sm text-gray-500">Track your journey</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/portal/appointments"
            className="portal-card flex flex-col items-center gap-3 py-6 hover:border-earth-300/30 transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl bg-earth-300/10 flex items-center justify-center group-hover:bg-earth-300/20 transition-colors">
              <svg className="w-6 h-6 text-earth-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM12 15h.008v.008H12V15zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-300">View Appointments</span>
          </Link>

          <Link
            href="/portal/diary"
            className="portal-card flex flex-col items-center gap-3 py-6 hover:border-emerald-500/30 transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-300">Log Symptoms</span>
          </Link>

          <Link
            href="/portal/tongue"
            className="portal-card flex flex-col items-center gap-3 py-6 hover:border-cyan-400/30 transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-400/10 flex items-center justify-center group-hover:bg-cyan-400/20 transition-colors">
              <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-300">Tongue Check</span>
          </Link>

          <Link
            href="/portal/messages"
            className="portal-card flex flex-col items-center gap-3 py-6 hover:border-purple-500/30 transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
              <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-300">Message Practitioner</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
