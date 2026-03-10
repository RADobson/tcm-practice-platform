'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import toast from 'react-hot-toast';

type PatientOption = { id: string; first_name: string; last_name: string };

interface PatternDifferential {
  pattern: string;
  confidence: number;
  supporting_evidence: string[];
  contradicting_evidence: string[];
  zang_fu: string[];
  eight_principles: {
    yin_yang?: string;
    interior_exterior?: string;
    cold_heat?: string;
    deficiency_excess?: string;
  };
  six_stages?: string;
  san_jiao?: string;
  wei_qi_ying_xue?: string;
}

interface AdditionalQuestion {
  question: string;
  reasoning: string;
}

interface SynthesisResult {
  pattern_differentials: PatternDifferential[];
  primary_pattern: string;
  pattern_relationships: string;
  contradictions: string[];
  additional_questions: AdditionalQuestion[];
  diagnostic_summary: string;
  saved_record?: { id: string };
}

interface DataCounts {
  tongue: number;
  pulse: number;
  symptoms: number;
  notes: number;
  patterns: number;
}

export default function AISynthesisPage() {
  const { practice } = useAppStore();
  const supabase = createClient();

  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [loading, setLoading] = useState(true);
  const [synthesising, setSynthesising] = useState(false);
  const [saving, setSaving] = useState(false);

  // Data availability
  const [dataCounts, setDataCounts] = useState<DataCounts>({
    tongue: 0, pulse: 0, symptoms: 0, notes: 0, patterns: 0,
  });

  // Result
  const [result, setResult] = useState<SynthesisResult | null>(null);

  useEffect(() => {
    if (!practice) return;
    loadPatients();
  }, [practice]);

  useEffect(() => {
    if (!selectedPatientId || !practice) return;
    loadDataCounts();
    setResult(null);
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

  async function loadDataCounts() {
    const [tongue, pulse, symptoms, notes, patterns] = await Promise.all([
      supabase.from('tongue_analyses').select('id', { count: 'exact', head: true }).eq('patient_id', selectedPatientId),
      supabase.from('pulse_diagnoses').select('id', { count: 'exact', head: true }).eq('patient_id', selectedPatientId),
      supabase.from('symptom_diary').select('id', { count: 'exact', head: true }).eq('patient_id', selectedPatientId),
      supabase.from('clinical_notes').select('id', { count: 'exact', head: true }).eq('patient_id', selectedPatientId),
      supabase.from('pattern_differentiations').select('id', { count: 'exact', head: true }).eq('patient_id', selectedPatientId),
    ]);
    setDataCounts({
      tongue: tongue.count || 0,
      pulse: pulse.count || 0,
      symptoms: symptoms.count || 0,
      notes: notes.count || 0,
      patterns: patterns.count || 0,
    });
  }

  async function handleSynthesise() {
    if (!practice || !selectedPatientId) return;
    setSynthesising(true);
    setResult(null);
    try {
      const res = await fetch('/api/diagnostics/synthesise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: selectedPatientId,
          practice_id: practice.id,
        }),
      });
      if (!res.ok) throw new Error('Synthesis failed');
      const data = await res.json();
      setResult(data);
      toast.success('Pattern synthesis complete');
    } catch {
      toast.error('Failed to synthesise patterns');
    } finally {
      setSynthesising(false);
    }
  }

  async function handleSave() {
    if (!practice || !selectedPatientId) return;
    setSaving(true);
    try {
      const res = await fetch('/api/diagnostics/synthesise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: selectedPatientId,
          practice_id: practice.id,
          save: true,
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      toast.success('Synthesis saved to patient record');
    } catch {
      toast.error('Failed to save synthesis');
    } finally {
      setSaving(false);
    }
  }

  function confidenceColor(conf: number) {
    if (conf >= 0.75) return 'text-emerald-400 bg-emerald-400/10';
    if (conf >= 0.5) return 'text-amber-400 bg-amber-400/10';
    return 'text-red-400 bg-red-400/10';
  }

  function confidenceBar(conf: number) {
    if (conf >= 0.75) return 'bg-emerald-400';
    if (conf >= 0.5) return 'bg-amber-400';
    return 'bg-red-400';
  }

  const totalData = dataCounts.tongue + dataCounts.pulse + dataCounts.symptoms + dataCounts.notes;

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
          <h1 className="text-2xl font-bold text-white">AI Pattern Synthesiser</h1>
          <p className="text-sm text-gray-400">Comprehensive differential diagnosis from all patient data</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-6">
        <p className="text-xs text-amber-400">
          AI synthesis is a clinical decision support tool. All pattern differentials must be validated through clinical examination and practitioner judgment.
        </p>
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
          <div className="text-4xl mb-3 opacity-30">⬡</div>
          <p className="text-gray-400">Select a patient to synthesise diagnostic patterns</p>
        </div>
      ) : (
        <>
          {/* Data Availability */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            {[
              { label: 'Tongue', count: dataCounts.tongue, icon: '◉' },
              { label: 'Pulse', count: dataCounts.pulse, icon: '♡' },
              { label: 'Diary', count: dataCounts.symptoms, icon: '📓' },
              { label: 'Notes', count: dataCounts.notes, icon: '✎' },
              { label: 'Patterns', count: dataCounts.patterns, icon: '⬡' },
            ].map((item) => (
              <div key={item.label} className="card text-center py-3">
                <div className="text-lg mb-1">{item.icon}</div>
                <div className={`text-xl font-bold ${item.count > 0 ? 'text-white' : 'text-gray-600'}`}>
                  {item.count}
                </div>
                <div className="text-xs text-gray-500">{item.label}</div>
              </div>
            ))}
          </div>

          {/* Synthesise Button */}
          <div className="mb-6">
            <button
              onClick={handleSynthesise}
              disabled={synthesising || totalData === 0}
              className="btn-cyan w-full py-3 text-base flex items-center justify-center gap-2"
            >
              {synthesising ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Synthesising patterns from {totalData} data points...
                </>
              ) : totalData === 0 ? (
                'No diagnostic data available — add tongue, pulse, or diary entries first'
              ) : (
                `Synthesise from ${totalData} data points`
              )}
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-6">
              {/* Primary Pattern */}
              {result.primary_pattern && (
                <div className="card border-earth-300/20">
                  <h2 className="text-lg font-semibold text-earth-300 mb-2">Primary Pattern</h2>
                  <p className="text-xl text-white font-bold">{result.primary_pattern}</p>
                  {result.pattern_relationships && (
                    <p className="text-sm text-gray-400 mt-2">{result.pattern_relationships}</p>
                  )}
                </div>
              )}

              {/* Diagnostic Summary */}
              {result.diagnostic_summary && (
                <div className="card">
                  <h3 className="text-sm font-medium text-white mb-2">Diagnostic Summary</h3>
                  <p className="text-sm text-gray-300">{result.diagnostic_summary}</p>
                </div>
              )}

              {/* Pattern Differentials */}
              {result.pattern_differentials && result.pattern_differentials.length > 0 && (
                <div className="card">
                  <h3 className="text-sm font-medium text-white mb-4">Ranked Differentials</h3>
                  <div className="space-y-4">
                    {result.pattern_differentials.map((diff, idx) => (
                      <div key={idx} className="bg-dark-300 rounded-lg p-4 border border-dark-50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-gray-500">#{idx + 1}</span>
                            <span className="text-white font-semibold">{diff.pattern}</span>
                          </div>
                          <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${confidenceColor(diff.confidence)}`}>
                            {Math.round(diff.confidence * 100)}%
                          </span>
                        </div>

                        {/* Confidence Bar */}
                        <div className="w-full bg-dark-500 rounded-full h-1.5 mb-3">
                          <div
                            className={`h-1.5 rounded-full ${confidenceBar(diff.confidence)}`}
                            style={{ width: `${diff.confidence * 100}%` }}
                          />
                        </div>

                        {/* Eight Principles */}
                        {diff.eight_principles && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {Object.entries(diff.eight_principles).map(([key, val]) => val && (
                              <span key={key} className="badge-earth text-xs">
                                {val}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Zang-Fu, Six Stages, San Jiao, Wei-Qi-Ying-Xue */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {diff.zang_fu?.map((z, i) => (
                            <span key={i} className="badge-cyan text-xs">{z}</span>
                          ))}
                          {diff.six_stages && <span className="badge text-xs bg-purple-500/10 text-purple-400">Six Stages: {diff.six_stages}</span>}
                          {diff.san_jiao && <span className="badge text-xs bg-blue-500/10 text-blue-400">San Jiao: {diff.san_jiao}</span>}
                          {diff.wei_qi_ying_xue && <span className="badge text-xs bg-rose-500/10 text-rose-400">Wei-Qi-Ying-Xue: {diff.wei_qi_ying_xue}</span>}
                        </div>

                        {/* Supporting Evidence */}
                        {diff.supporting_evidence?.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs text-gray-500 mb-1">Supporting evidence</p>
                            <div className="flex flex-wrap gap-1">
                              {diff.supporting_evidence.map((e, i) => (
                                <span key={i} className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">
                                  {e}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Contradicting Evidence */}
                        {diff.contradicting_evidence?.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Contradicting evidence</p>
                            <div className="flex flex-wrap gap-1">
                              {diff.contradicting_evidence.map((e, i) => (
                                <span key={i} className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded">
                                  {e}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contradictions */}
              {result.contradictions && result.contradictions.length > 0 && (
                <div className="card border-amber-500/20">
                  <h3 className="text-sm font-medium text-amber-400 mb-3">Contradictions / Unusual Presentations</h3>
                  <ul className="space-y-2">
                    {result.contradictions.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-amber-400 mt-0.5">⚠</span> {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Additional Questions */}
              {result.additional_questions && result.additional_questions.length > 0 && (
                <div className="card border-cyan-400/20">
                  <h3 className="text-sm font-medium text-cyan-400 mb-3">Suggested Questions to Narrow Differentials</h3>
                  <div className="space-y-3">
                    {result.additional_questions.map((q, i) => (
                      <div key={i} className="bg-dark-300 rounded-lg p-3">
                        <p className="text-sm text-white mb-1">{q.question}</p>
                        <p className="text-xs text-gray-500">{q.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary w-full py-3"
              >
                {saving ? 'Saving...' : 'Save Synthesis to Patient Record'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
