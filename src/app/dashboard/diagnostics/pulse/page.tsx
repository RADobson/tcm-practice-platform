'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { PULSE_QUALITIES, PULSE_POSITIONS } from '@/lib/tcm-data';
import type { PulseDiagnosis, PulsePosition } from '@/lib/types';

type PatientOption = { id: string; first_name: string; last_name: string };

const DEPTH_OPTIONS = ['Superficial', 'Middle', 'Deep'];
const STRENGTH_OPTIONS = ['Weak', 'Moderate', 'Strong', 'Forceful'];

function emptyPosition(organ: string): PulsePosition {
  return { qualities: [], organ, depth: '', strength: '', notes: '' };
}

export default function PulseDiagnosisPage() {
  const { practice, profile } = useAppStore();
  const supabase = createClient();

  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Pulse positions
  const [positions, setPositions] = useState<Record<string, PulsePosition>>({
    left_cun: emptyPosition('Heart / Small Intestine'),
    left_guan: emptyPosition('Liver / Gallbladder'),
    left_chi: emptyPosition('Kidney Yin / Bladder'),
    right_cun: emptyPosition('Lung / Large Intestine'),
    right_guan: emptyPosition('Spleen / Stomach'),
    right_chi: emptyPosition('Kidney Yang / Ming Men'),
  });

  const [overallRate, setOverallRate] = useState<number | ''>('');
  const [overallNotes, setOverallNotes] = useState('');

  // UI state
  const [expandedPosition, setExpandedPosition] = useState<string | null>(null);
  const [qualitySearch, setQualitySearch] = useState('');

  // History
  const [history, setHistory] = useState<PulseDiagnosis[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!practice) return;
    loadPatients();
  }, [practice]);

  useEffect(() => {
    if (!selectedPatientId || !practice) return;
    loadHistory();
  }, [selectedPatientId, practice]);

  async function loadPatients() {
    const { data } = await supabase
      .from('patients')
      .select('id, first_name, last_name')
      .eq('practice_id', practice!.id)
      .eq('is_active', true)
      .order('last_name');
    setPatients(data || []);
    setLoading(false);
  }

  async function loadHistory() {
    const { data } = await supabase
      .from('pulse_diagnoses')
      .select('*')
      .eq('patient_id', selectedPatientId)
      .order('created_at', { ascending: false })
      .limit(20);
    setHistory(data || []);
  }

  function updatePosition(key: string, updates: Partial<PulsePosition>) {
    setPositions((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...updates },
    }));
  }

  function toggleQuality(positionKey: string, qualityName: string) {
    const current = positions[positionKey].qualities;
    const updated = current.includes(qualityName)
      ? current.filter((q) => q !== qualityName)
      : [...current, qualityName];
    updatePosition(positionKey, { qualities: updated });
  }

  async function handleSave() {
    if (!practice || !profile) return;
    if (!selectedPatientId) {
      toast.error('Please select a patient');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from('pulse_diagnoses').insert({
        practice_id: practice.id,
        patient_id: selectedPatientId,
        practitioner_id: profile.id,
        left_cun: positions.left_cun,
        left_guan: positions.left_guan,
        left_chi: positions.left_chi,
        right_cun: positions.right_cun,
        right_guan: positions.right_guan,
        right_chi: positions.right_chi,
        overall_rate: overallRate || null,
        overall_notes: overallNotes || null,
      });
      if (error) throw error;
      toast.success('Pulse diagnosis saved');
      loadHistory();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  function loadFromHistory(diagnosis: PulseDiagnosis) {
    setPositions({
      left_cun: diagnosis.left_cun,
      left_guan: diagnosis.left_guan,
      left_chi: diagnosis.left_chi,
      right_cun: diagnosis.right_cun,
      right_guan: diagnosis.right_guan,
      right_chi: diagnosis.right_chi,
    });
    setOverallRate(diagnosis.overall_rate || '');
    setOverallNotes(diagnosis.overall_notes || '');
    setShowHistory(false);
  }

  function getPositionSummary(pos: PulsePosition): string {
    const parts: string[] = [];
    if (pos.qualities.length > 0) parts.push(pos.qualities.join(', '));
    if (pos.depth) parts.push(pos.depth);
    if (pos.strength) parts.push(pos.strength);
    return parts.join(' | ') || 'Not assessed';
  }

  // Arrange positions: left column (left_cun, left_guan, left_chi), right column (right_cun, right_guan, right_chi)
  const leftPositions = PULSE_POSITIONS.filter((p) => p.key.startsWith('left'));
  const rightPositions = PULSE_POSITIONS.filter((p) => p.key.startsWith('right'));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Pulse Diagnosis</h1>
          <p className="text-sm text-gray-400">Record pulse qualities at each position</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="btn-secondary text-sm"
          >
            {showHistory ? 'New Diagnosis' : 'View History'}
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Diagnosis'}
          </button>
        </div>
      </div>

      {/* Patient Selector */}
      <div className="card mb-6">
        <label className="input-label">Select Patient</label>
        <select
          className="input-field max-w-md"
          value={selectedPatientId}
          onChange={(e) => setSelectedPatientId(e.target.value)}
        >
          <option value="">Choose a patient...</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.last_name}, {p.first_name}
            </option>
          ))}
        </select>
      </div>

      {!selectedPatientId ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3 opacity-30">&#9825;</div>
          <p className="text-gray-400">Select a patient to begin pulse diagnosis</p>
        </div>
      ) : showHistory ? (
        /* History View */
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">
            Pulse History ({history.length})
          </h2>
          {history.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-400">No previous pulse diagnoses for this patient.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="card-hover"
                  onClick={() => loadFromHistory(item)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-white font-medium">
                        {format(new Date(item.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                      {item.overall_rate && (
                        <p className="text-sm text-gray-400 mt-1">
                          Overall Rate: <span className="text-earth-300">{item.overall_rate} BPM</span>
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-x-8 gap-y-1 mt-2">
                        {PULSE_POSITIONS.map((pos) => {
                          const data = item[pos.key as keyof PulseDiagnosis] as PulsePosition;
                          return (
                            <div key={pos.key} className="text-xs">
                              <span className="text-gray-500">{pos.label}:</span>{' '}
                              <span className="text-gray-300">
                                {data?.qualities?.length > 0
                                  ? data.qualities.slice(0, 3).join(', ')
                                  : '—'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <span className="text-xs text-cyan-400 hover:text-cyan-300 flex-shrink-0">
                      Load
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Diagnosis Form */
        <div className="space-y-6">
          {/* Overall Rate */}
          <div className="card">
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <label className="input-label">Overall Pulse Rate (BPM)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    className="input-field max-w-[140px]"
                    placeholder="72"
                    min={30}
                    max={200}
                    value={overallRate}
                    onChange={(e) =>
                      setOverallRate(e.target.value ? parseInt(e.target.value) : '')
                    }
                  />
                  <div className="text-sm">
                    {typeof overallRate === 'number' && (
                      <span
                        className={
                          overallRate < 60
                            ? 'text-blue-400'
                            : overallRate > 90
                            ? 'text-red-400'
                            : 'text-emerald-400'
                        }
                      >
                        {overallRate < 60
                          ? 'Slow (Chi)'
                          : overallRate > 90
                          ? 'Rapid (Shuo)'
                          : 'Normal range'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Position Grid - 2x3 layout */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Left Wrist */}
            <div>
              <h3 className="text-sm font-semibold text-earth-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-earth-300"></span>
                Left Wrist
              </h3>
              <div className="space-y-3">
                {leftPositions.map((pos) => (
                  <PositionCard
                    key={pos.key}
                    positionKey={pos.key}
                    label={pos.label}
                    organ={pos.organ}
                    position={positions[pos.key]}
                    isExpanded={expandedPosition === pos.key}
                    onToggle={() =>
                      setExpandedPosition(
                        expandedPosition === pos.key ? null : pos.key
                      )
                    }
                    onUpdatePosition={(updates) =>
                      updatePosition(pos.key, updates)
                    }
                    onToggleQuality={(quality) =>
                      toggleQuality(pos.key, quality)
                    }
                    qualitySearch={qualitySearch}
                    setQualitySearch={setQualitySearch}
                  />
                ))}
              </div>
            </div>

            {/* Right Wrist */}
            <div>
              <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                Right Wrist
              </h3>
              <div className="space-y-3">
                {rightPositions.map((pos) => (
                  <PositionCard
                    key={pos.key}
                    positionKey={pos.key}
                    label={pos.label}
                    organ={pos.organ}
                    position={positions[pos.key]}
                    isExpanded={expandedPosition === pos.key}
                    onToggle={() =>
                      setExpandedPosition(
                        expandedPosition === pos.key ? null : pos.key
                      )
                    }
                    onUpdatePosition={(updates) =>
                      updatePosition(pos.key, updates)
                    }
                    onToggleQuality={(quality) =>
                      toggleQuality(pos.key, quality)
                    }
                    qualitySearch={qualitySearch}
                    setQualitySearch={setQualitySearch}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Overall Assessment Notes */}
          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-3">Overall Assessment</h2>
            <textarea
              className="input-field"
              rows={4}
              placeholder="Overall pulse observations, clinical interpretation..."
              value={overallNotes}
              onChange={(e) => setOverallNotes(e.target.value)}
            />
          </div>

          {/* Quick Summary */}
          <div className="card bg-dark-500">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              {PULSE_POSITIONS.map((pos) => (
                <div key={pos.key} className="text-sm">
                  <span className="text-gray-500 text-xs">{pos.label}</span>
                  <p className="text-gray-300 text-xs mt-0.5">
                    {getPositionSummary(positions[pos.key])}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================
   Position Card Component
   ============================================ */

interface PositionCardProps {
  positionKey: string;
  label: string;
  organ: string;
  position: PulsePosition;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdatePosition: (updates: Partial<PulsePosition>) => void;
  onToggleQuality: (quality: string) => void;
  qualitySearch: string;
  setQualitySearch: (v: string) => void;
}

function PositionCard({
  positionKey: _positionKey, // eslint-disable-line @typescript-eslint/no-unused-vars
  label,
  organ,
  position,
  isExpanded,
  onToggle,
  onUpdatePosition,
  onToggleQuality,
  qualitySearch,
  setQualitySearch,
}: PositionCardProps) {
  const hasData =
    position.qualities.length > 0 || position.depth || position.strength;

  const filteredQualities = PULSE_QUALITIES.filter(
    (q) =>
      q.name.toLowerCase().includes(qualitySearch.toLowerCase()) ||
      q.pinyin.toLowerCase().includes(qualitySearch.toLowerCase())
  );

  return (
    <div
      className={`card transition-all duration-200 ${
        hasData ? 'border-earth-300/20' : ''
      }`}
    >
      {/* Header - always visible */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <div>
          <h4 className="text-sm font-semibold text-white">{label}</h4>
          <p className="text-xs text-gray-500">{organ}</p>
        </div>
        <div className="flex items-center gap-2">
          {position.qualities.length > 0 && (
            <span className="badge-earth text-xs">
              {position.qualities.length} qualities
            </span>
          )}
          <span
            className={`text-gray-500 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          >
            &#9660;
          </span>
        </div>
      </div>

      {/* Collapsed summary */}
      {!isExpanded && hasData && (
        <div className="mt-2 flex flex-wrap gap-1">
          {position.qualities.slice(0, 4).map((q) => (
            <span key={q} className="text-xs bg-dark-300 text-gray-400 px-2 py-0.5 rounded">
              {q}
            </span>
          ))}
          {position.qualities.length > 4 && (
            <span className="text-xs text-gray-600">
              +{position.qualities.length - 4} more
            </span>
          )}
          {position.depth && (
            <span className="text-xs bg-dark-300 text-cyan-400/70 px-2 py-0.5 rounded">
              {position.depth}
            </span>
          )}
          {position.strength && (
            <span className="text-xs bg-dark-300 text-earth-300/70 px-2 py-0.5 rounded">
              {position.strength}
            </span>
          )}
        </div>
      )}

      {/* Expanded form */}
      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Depth and Strength */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Depth</label>
              <select
                className="input-field text-sm"
                value={position.depth || ''}
                onChange={(e) => onUpdatePosition({ depth: e.target.value })}
              >
                <option value="">Select...</option>
                {DEPTH_OPTIONS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Strength</label>
              <select
                className="input-field text-sm"
                value={position.strength || ''}
                onChange={(e) => onUpdatePosition({ strength: e.target.value })}
              >
                <option value="">Select...</option>
                {STRENGTH_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Pulse Qualities - multi-select checkboxes */}
          <div>
            <label className="input-label">Pulse Qualities (select all that apply)</label>
            <input
              className="input-field text-sm mb-2"
              placeholder="Search qualities..."
              value={qualitySearch}
              onChange={(e) => setQualitySearch(e.target.value)}
            />
            <div className="max-h-52 overflow-y-auto space-y-0.5 pr-1">
              {filteredQualities.map((q) => {
                const isSelected = position.qualities.includes(q.name);
                return (
                  <label
                    key={q.name}
                    className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-earth-300/10 border border-earth-300/20'
                        : 'hover:bg-dark-300 border border-transparent'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleQuality(q.name)}
                      className="mt-0.5 accent-earth-300"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white">{q.name}</span>
                        <span className="text-xs text-gray-600">{q.pinyin}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{q.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Position Notes */}
          <div>
            <label className="input-label">Notes</label>
            <textarea
              className="input-field text-sm"
              rows={2}
              placeholder="Notes for this position..."
              value={position.notes || ''}
              onChange={(e) => onUpdatePosition({ notes: e.target.value })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
