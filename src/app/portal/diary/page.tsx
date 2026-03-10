'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { SymptomEntry } from '@/lib/types';

interface DiaryForm {
  energy_level: number;
  sleep_quality: number;
  sleep_hours: number;
  pain_level: number;
  digestion: number;
  mood: number;
  stress_level: number;
  appetite: string;
  bowel_movements: string;
  emotional_state: string;
  notes: string;
}

const DEFAULT_FORM: DiaryForm = {
  energy_level: 5,
  sleep_quality: 5,
  sleep_hours: 7,
  pain_level: 0,
  digestion: 5,
  mood: 5,
  stress_level: 5,
  appetite: 'Good',
  bowel_movements: 'Normal',
  emotional_state: '',
  notes: '',
};

function SliderField({
  label,
  value,
  onChange,
  min = 1,
  max = 10,
  lowLabel,
  highLabel,
  color = 'earth',
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  lowLabel?: string;
  highLabel?: string;
  color?: 'earth' | 'cyan' | 'emerald' | 'amber' | 'purple' | 'red';
}) {
  const colorMap = {
    earth: 'accent-[#D4A574]',
    cyan: 'accent-[#00F0FF]',
    emerald: 'accent-emerald-400',
    amber: 'accent-amber-400',
    purple: 'accent-purple-400',
    red: 'accent-red-400',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="input-label mb-0">{label}</label>
        <span className="text-sm font-semibold text-white">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full h-2 rounded-full bg-dark-200 appearance-none cursor-pointer ${colorMap[color]}`}
      />
      {(lowLabel || highLabel) && (
        <div className="flex justify-between mt-0.5">
          <span className="text-[10px] text-gray-600">{lowLabel}</span>
          <span className="text-[10px] text-gray-600">{highLabel}</span>
        </div>
      )}
    </div>
  );
}

export default function PortalDiary() {
  const { profile } = useAppStore();
  const supabase = createClient();

  const [form, setForm] = useState<DiaryForm>(DEFAULT_FORM);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [entries, setEntries] = useState<SymptomEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [todayLogged, setTodayLogged] = useState(false);

  useEffect(() => {
    if (!profile) return;
    loadData();
  }, [profile]);

  async function loadData() {
    if (!profile) return;

    try {
      const { data: patient } = await supabase
        .from('patients')
        .select('id, practice_id')
        .eq('user_id', profile.id)
        .single();

      if (!patient) {
        setLoading(false);
        return;
      }

      setPatientId(patient.id);
      setPracticeId(patient.practice_id);

      // Check if already logged today
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data: todayEntry } = await supabase
        .from('symptom_entries')
        .select('*')
        .eq('patient_id', patient.id)
        .eq('entry_date', today)
        .single();

      if (todayEntry) {
        setTodayLogged(true);
        setForm({
          energy_level: todayEntry.energy_level ?? 5,
          sleep_quality: todayEntry.sleep_quality ?? 5,
          sleep_hours: todayEntry.sleep_hours ?? 7,
          pain_level: todayEntry.pain_level ?? 0,
          digestion: todayEntry.digestion ?? 5,
          mood: todayEntry.mood ?? 5,
          stress_level: todayEntry.stress_level ?? 5,
          appetite: todayEntry.appetite ?? 'Good',
          bowel_movements: todayEntry.bowel_movements ?? 'Normal',
          emotional_state: todayEntry.emotional_state ?? '',
          notes: todayEntry.notes ?? '',
        });
      }

      // Load past entries
      const { data: pastEntries } = await supabase
        .from('symptom_entries')
        .select('*')
        .eq('patient_id', patient.id)
        .order('entry_date', { ascending: false })
        .limit(30);

      setEntries(pastEntries || []);
    } catch (err) {
      console.error('Failed to load diary data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!patientId || !practiceId || !profile) return;

    setSubmitting(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');

      const payload = {
        patient_id: patientId,
        practice_id: practiceId,
        entry_date: today,
        energy_level: form.energy_level,
        sleep_quality: form.sleep_quality,
        sleep_hours: form.sleep_hours,
        pain_level: form.pain_level,
        digestion: form.digestion,
        mood: form.mood,
        stress_level: form.stress_level,
        appetite: form.appetite,
        bowel_movements: form.bowel_movements,
        emotional_state: form.emotional_state || null,
        notes: form.notes || null,
        custom_symptoms: {},
      };

      if (todayLogged) {
        // Update existing entry
        const { error } = await supabase
          .from('symptom_entries')
          .update(payload)
          .eq('patient_id', patientId)
          .eq('entry_date', today);

        if (error) throw error;
        toast.success('Diary entry updated!');
      } else {
        // Create new entry
        const { error } = await supabase
          .from('symptom_entries')
          .insert(payload);

        if (error) throw error;
        toast.success('Diary entry saved!');
        setTodayLogged(true);
      }

      // Reload entries
      const { data: refreshed } = await supabase
        .from('symptom_entries')
        .select('*')
        .eq('patient_id', patientId)
        .order('entry_date', { ascending: false })
        .limit(30);

      setEntries(refreshed || []);
    } catch (err) {
      console.error('Failed to save diary:', err);
      toast.error('Failed to save entry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function getScoreColor(value: number, inverted = false): string {
    const v = inverted ? 11 - value : value;
    if (v >= 8) return 'text-emerald-400';
    if (v >= 5) return 'text-amber-400';
    return 'text-red-400';
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-earth-300/30 border-t-earth-300 rounded-full animate-spin" />
          <span className="text-sm text-gray-400">Loading diary...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Symptom Diary</h1>
        <p className="text-gray-400 text-sm mt-1">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
          {todayLogged && (
            <span className="badge-success ml-2">Logged today</span>
          )}
        </p>
      </div>

      {/* Entry Form */}
      <div className="portal-card space-y-5">
        <h2 className="text-lg font-semibold text-white">
          {todayLogged ? 'Update Today\'s Entry' : 'Log Today\'s Symptoms'}
        </h2>

        <SliderField
          label="Energy Level"
          value={form.energy_level}
          onChange={(v) => setForm({ ...form, energy_level: v })}
          lowLabel="Exhausted"
          highLabel="Energetic"
          color="amber"
        />

        <SliderField
          label="Sleep Quality"
          value={form.sleep_quality}
          onChange={(v) => setForm({ ...form, sleep_quality: v })}
          lowLabel="Very poor"
          highLabel="Excellent"
          color="purple"
        />

        <div>
          <label className="input-label">Sleep Hours</label>
          <input
            type="number"
            min={0}
            max={24}
            step={0.5}
            value={form.sleep_hours}
            onChange={(e) => setForm({ ...form, sleep_hours: parseFloat(e.target.value) || 0 })}
            className="input-field"
          />
        </div>

        <SliderField
          label="Pain Level"
          value={form.pain_level}
          onChange={(v) => setForm({ ...form, pain_level: v })}
          min={0}
          lowLabel="No pain"
          highLabel="Severe"
          color="red"
        />

        <SliderField
          label="Digestion"
          value={form.digestion}
          onChange={(v) => setForm({ ...form, digestion: v })}
          lowLabel="Very poor"
          highLabel="Excellent"
          color="emerald"
        />

        <SliderField
          label="Mood"
          value={form.mood}
          onChange={(v) => setForm({ ...form, mood: v })}
          lowLabel="Very low"
          highLabel="Great"
          color="cyan"
        />

        <SliderField
          label="Stress Level"
          value={form.stress_level}
          onChange={(v) => setForm({ ...form, stress_level: v })}
          lowLabel="Calm"
          highLabel="Very stressed"
          color="red"
        />

        <div>
          <label className="input-label">Appetite</label>
          <select
            value={form.appetite}
            onChange={(e) => setForm({ ...form, appetite: e.target.value })}
            className="input-field"
          >
            <option value="Poor">Poor</option>
            <option value="Fair">Fair</option>
            <option value="Good">Good</option>
            <option value="Excellent">Excellent</option>
          </select>
        </div>

        <div>
          <label className="input-label">Bowel Movements</label>
          <select
            value={form.bowel_movements}
            onChange={(e) => setForm({ ...form, bowel_movements: e.target.value })}
            className="input-field"
          >
            <option value="Constipation">Constipation</option>
            <option value="Normal">Normal</option>
            <option value="Loose">Loose</option>
            <option value="Diarrhea">Diarrhea</option>
          </select>
        </div>

        <div>
          <label className="input-label">Emotional State</label>
          <input
            type="text"
            value={form.emotional_state}
            onChange={(e) => setForm({ ...form, emotional_state: e.target.value })}
            placeholder="How are you feeling emotionally?"
            className="input-field"
          />
        </div>

        <div>
          <label className="input-label">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Any additional observations..."
            rows={3}
            className="input-field resize-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="portal-btn bg-earth-300 hover:bg-earth-400 text-dark-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Saving...' : todayLogged ? 'Update Entry' : 'Save Entry'}
        </button>
      </div>

      {/* History Timeline */}
      {entries.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Recent History</h2>
          <div className="space-y-3">
            {entries.map((entry) => (
              <div key={entry.id} className="portal-card">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-white">
                    {format(new Date(entry.entry_date), 'EEE, MMM d, yyyy')}
                  </p>
                  <div className="flex gap-1">
                    {entry.appetite && (
                      <span className="badge-earth text-[10px]">{entry.appetite}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-xs">
                  {entry.energy_level != null && (
                    <div>
                      <span className="text-gray-500">Energy</span>
                      <p className={`font-semibold ${getScoreColor(entry.energy_level)}`}>
                        {entry.energy_level}/10
                      </p>
                    </div>
                  )}
                  {entry.sleep_quality != null && (
                    <div>
                      <span className="text-gray-500">Sleep</span>
                      <p className={`font-semibold ${getScoreColor(entry.sleep_quality)}`}>
                        {entry.sleep_quality}/10
                      </p>
                    </div>
                  )}
                  {entry.sleep_hours != null && (
                    <div>
                      <span className="text-gray-500">Hours</span>
                      <p className="font-semibold text-white">{entry.sleep_hours}h</p>
                    </div>
                  )}
                  {entry.pain_level != null && (
                    <div>
                      <span className="text-gray-500">Pain</span>
                      <p className={`font-semibold ${getScoreColor(entry.pain_level, true)}`}>
                        {entry.pain_level}/10
                      </p>
                    </div>
                  )}
                  {entry.digestion != null && (
                    <div>
                      <span className="text-gray-500">Digestion</span>
                      <p className={`font-semibold ${getScoreColor(entry.digestion)}`}>
                        {entry.digestion}/10
                      </p>
                    </div>
                  )}
                  {entry.mood != null && (
                    <div>
                      <span className="text-gray-500">Mood</span>
                      <p className={`font-semibold ${getScoreColor(entry.mood)}`}>
                        {entry.mood}/10
                      </p>
                    </div>
                  )}
                  {entry.stress_level != null && (
                    <div>
                      <span className="text-gray-500">Stress</span>
                      <p className={`font-semibold ${getScoreColor(entry.stress_level, true)}`}>
                        {entry.stress_level}/10
                      </p>
                    </div>
                  )}
                  {entry.bowel_movements && (
                    <div>
                      <span className="text-gray-500">Bowels</span>
                      <p className="font-semibold text-white">{entry.bowel_movements}</p>
                    </div>
                  )}
                </div>

                {entry.emotional_state && (
                  <p className="text-xs text-gray-400 mt-2 italic">
                    &ldquo;{entry.emotional_state}&rdquo;
                  </p>
                )}
                {entry.notes && (
                  <p className="text-xs text-gray-500 mt-1">{entry.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {entries.length === 0 && (
        <div className="portal-card text-center py-8">
          <svg className="w-10 h-10 text-gray-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
          <p className="text-gray-400 text-sm">No diary entries yet.</p>
          <p className="text-gray-500 text-xs mt-1">Log your first entry above to start tracking.</p>
        </div>
      )}
    </div>
  );
}
