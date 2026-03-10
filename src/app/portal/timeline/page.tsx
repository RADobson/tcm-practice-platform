'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { format, isToday, isYesterday, isThisYear } from 'date-fns';

interface TimelineItem {
  id: string;
  type: 'appointment' | 'treatment' | 'note' | 'tongue' | 'diary' | 'body_map';
  date: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  appointment: {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    color: 'text-earth-300',
    bg: 'bg-earth-300/20',
  },
  treatment: {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5" />
      </svg>
    ),
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/20',
  },
  note: {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    color: 'text-purple-400',
    bg: 'bg-purple-400/20',
  },
  tongue: {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
      </svg>
    ),
    color: 'text-amber-400',
    bg: 'bg-amber-400/20',
  },
  diary: {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/20',
  },
  body_map: {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    color: 'text-rose-400',
    bg: 'bg-rose-400/20',
  },
};

export default function PortalTimeline() {
  const { profile } = useAppStore();
  const supabase = createClient();

  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (!profile) return;
    loadTimeline();
  }, [profile]);

  async function loadTimeline() {
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

      const allItems: TimelineItem[] = [];

      // Appointments
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patient.id)
        .order('start_time', { ascending: false })
        .limit(50);

      if (appointments) {
        for (const appt of appointments) {
          allItems.push({
            id: `appt-${appt.id}`,
            type: 'appointment',
            date: appt.start_time,
            title: `${appt.type} - ${appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}`,
            description: appt.chief_complaint || undefined,
          });
        }
      }

      // Treatments
      const { data: treatments } = await supabase
        .from('treatment_records')
        .select('*')
        .eq('patient_id', patient.id)
        .order('treatment_date', { ascending: false })
        .limit(50);

      if (treatments) {
        for (const t of treatments) {
          const techniques: string[] = [];
          if (t.acupuncture_points?.length > 0) techniques.push('Acupuncture');
          if (t.moxa_applied) techniques.push('Moxa');
          if (t.cupping_applied) techniques.push('Cupping');
          if (t.tuina_applied) techniques.push('Tuina');

          allItems.push({
            id: `treat-${t.id}`,
            type: 'treatment',
            date: t.treatment_date,
            title: `Treatment: ${techniques.join(', ') || 'Session'}`,
            description: t.acupuncture_points?.length
              ? `${t.acupuncture_points.length} points treated`
              : undefined,
          });
        }
      }

      // Clinical Notes (patient_visible only)
      const { data: notes } = await supabase
        .from('clinical_notes')
        .select('*')
        .eq('patient_id', patient.id)
        .eq('patient_visible', true)
        .order('visit_date', { ascending: false })
        .limit(50);

      if (notes) {
        for (const note of notes) {
          allItems.push({
            id: `note-${note.id}`,
            type: 'note',
            date: note.visit_date,
            title: 'Clinical Note',
            description: note.assessment
              ? note.assessment.substring(0, 120) + (note.assessment.length > 120 ? '...' : '')
              : note.pattern_diagnosis || undefined,
          });
        }
      }

      // Tongue Analyses
      const { data: tongues } = await supabase
        .from('tongue_analyses')
        .select('*')
        .eq('patient_id', patient.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (tongues) {
        for (const t of tongues) {
          const details: string[] = [];
          if (t.body_color) details.push(t.body_color);
          if (t.coating_color) details.push(`${t.coating_color} coating`);

          allItems.push({
            id: `tongue-${t.id}`,
            type: 'tongue',
            date: t.created_at,
            title: `Tongue ${t.is_self_assessment ? 'Self-Assessment' : 'Analysis'}`,
            description: details.length > 0 ? details.join(', ') : undefined,
          });
        }
      }

      // Symptom Diary
      const { data: diaryEntries } = await supabase
        .from('symptom_entries')
        .select('*')
        .eq('patient_id', patient.id)
        .order('entry_date', { ascending: false })
        .limit(60);

      if (diaryEntries) {
        for (const entry of diaryEntries) {
          const details: string[] = [];
          if (entry.energy_level != null) details.push(`Energy: ${entry.energy_level}/10`);
          if (entry.pain_level != null && entry.pain_level > 0) details.push(`Pain: ${entry.pain_level}/10`);
          if (entry.mood != null) details.push(`Mood: ${entry.mood}/10`);

          allItems.push({
            id: `diary-${entry.id}`,
            type: 'diary',
            date: entry.entry_date,
            title: 'Symptom Diary Entry',
            description: details.length > 0 ? details.join(' | ') : undefined,
          });
        }
      }

      // Body Maps
      const { data: bodyMaps } = await supabase
        .from('trigger_point_maps')
        .select('*')
        .eq('patient_id', patient.id)
        .order('created_at', { ascending: false })
        .limit(30);

      if (bodyMaps) {
        for (const bm of bodyMaps) {
          allItems.push({
            id: `bm-${bm.id}`,
            type: 'body_map',
            date: bm.created_at,
            title: `Body Map ${bm.is_self_report ? '(Self-Report)' : ''}`,
            description: `${bm.points?.length || 0} pain point${(bm.points?.length || 0) !== 1 ? 's' : ''} recorded`,
          });
        }
      }

      // Sort all items by date descending
      allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setItems(allItems);
    } catch (err) {
      console.error('Failed to load timeline:', err);
    } finally {
      setLoading(false);
    }
  }

  function formatTimelineDate(dateStr: string): string {
    const date = new Date(dateStr);
    if (isToday(date)) return `Today, ${format(date, 'h:mm a')}`;
    if (isYesterday(date)) return `Yesterday, ${format(date, 'h:mm a')}`;
    if (isThisYear(date)) return format(date, 'MMM d, h:mm a');
    return format(date, 'MMM d, yyyy');
  }

  const filteredItems = filter === 'all'
    ? items
    : items.filter((i) => i.type === filter);

  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'appointment', label: 'Appointments' },
    { key: 'treatment', label: 'Treatments' },
    { key: 'note', label: 'Notes' },
    { key: 'tongue', label: 'Tongue' },
    { key: 'diary', label: 'Diary' },
    { key: 'body_map', label: 'Body Map' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-earth-300/30 border-t-earth-300 rounded-full animate-spin" />
          <span className="text-sm text-gray-400">Building timeline...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Your Timeline</h1>
        <p className="text-gray-400 text-sm mt-1">
          A chronological view of your health journey.
        </p>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f.key
                ? 'bg-earth-300/20 text-earth-300 border border-earth-300/30'
                : 'bg-dark-400 text-gray-400 border border-dark-50 hover:text-gray-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {filteredItems.length === 0 ? (
        <div className="portal-card text-center py-12">
          <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-400 text-sm">
            {filter === 'all'
              ? 'No activity yet.'
              : `No ${FILTERS.find((f) => f.key === filter)?.label.toLowerCase()} entries yet.`}
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-dark-50" />

          <div className="space-y-4">
            {filteredItems.map((item) => {
              const config = TYPE_CONFIG[item.type];

              return (
                <div key={item.id} className="relative flex gap-4 pl-1">
                  {/* Icon */}
                  <div
                    className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full ${config.bg} ${config.color} flex items-center justify-center`}
                  >
                    {config.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 portal-card py-3 px-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        {item.description && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-600 flex-shrink-0 whitespace-nowrap">
                        {formatTimelineDate(item.date)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
