'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { ZANG_FU_PATTERNS } from '@/lib/tcm-data';

type PatientOption = { id: string; first_name: string; last_name: string };

interface AcuPoint {
  point: string;
  location: string;
  reasoning: string;
  technique: string;
  needle_depth: string;
  moxa: boolean;
  moxa_method?: string;
}

interface PointCombination {
  name: string;
  points: string[];
  reasoning: string;
}

interface TreatmentPlanResult {
  treatment_principles: string[];
  acupuncture_protocol: AcuPoint[];
  point_combinations: PointCombination[];
  adjunct_therapies: {
    cupping?: { recommended: boolean; locations: string[]; method: string; reasoning: string };
    gua_sha?: { recommended: boolean; areas: string[]; reasoning: string };
    ear_seeds?: { recommended: boolean; points: { name: string; reasoning: string }[]; duration: string };
    electroacupuncture?: { recommended: boolean; pairs: { point1: string; point2: string; frequency: string; reasoning: string }[] };
  };
  session_plan?: {
    retention_time: number;
    frequency: string;
    expected_sessions: string;
  };
  clinical_reasoning: string;
  cautions: string[];
  saved_plan?: { id: string };
}

export default function TreatmentPlanPage() {
  const { practice } = useAppStore();
  const supabase = createClient();

  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Input
  const [patternDiagnosis, setPatternDiagnosis] = useState('');
  const [treatmentPrinciples, setTreatmentPrinciples] = useState('');
  const [patientInfo, setPatientInfo] = useState('');

  // Result
  const [result, setResult] = useState<TreatmentPlanResult | null>(null);

  useEffect(() => {
    if (!practice) return;
    loadPatients();
  }, [practice]);

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

  async function handleGenerate() {
    if (!patternDiagnosis.trim()) {
      toast.error('Please enter a pattern diagnosis');
      return;
    }
    setGenerating(true);
    setResult(null);
    try {
      const res = await fetch('/api/diagnostics/treatment-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pattern_diagnosis: patternDiagnosis,
          treatment_principles: treatmentPrinciples.split(',').map((s) => s.trim()).filter(Boolean),
          patient_info: patientInfo || undefined,
        }),
      });
      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json();
      setResult(data);
      toast.success('Treatment plan generated');
    } catch {
      toast.error('Failed to generate treatment plan');
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!result || !practice || !selectedPatientId) {
      toast.error('Select a patient to save the treatment plan');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/diagnostics/treatment-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pattern_diagnosis: patternDiagnosis,
          treatment_principles: treatmentPrinciples.split(',').map((s) => s.trim()).filter(Boolean),
          patient_info: patientInfo || undefined,
          patient_id: selectedPatientId,
          practice_id: practice.id,
          save: true,
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      toast.success('Treatment plan saved to patient record');
    } catch {
      toast.error('Failed to save treatment plan');
    } finally {
      setSaving(false);
    }
  }

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
          <h1 className="text-2xl font-bold text-white">AI Treatment Planner</h1>
          <p className="text-sm text-gray-400">Generate acupuncture protocols and adjunct therapy plans</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-6">
        <p className="text-xs text-amber-400">
          AI-generated treatment plans are for clinical decision support only. All protocols must be reviewed and approved by a licensed acupuncturist before application.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Input */}
        <div className="space-y-6">
          <div className="card">
            <label className="input-label">Patient (required for saving)</label>
            <select
              className="input-field"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
            >
              <option value="">Select patient...</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.last_name}, {p.first_name}
                </option>
              ))}
            </select>
          </div>

          <div className="card">
            <label className="input-label">Pattern Diagnosis *</label>
            <input
              className="input-field mb-3"
              placeholder="e.g. Liver Qi Stagnation with Spleen Qi Deficiency"
              value={patternDiagnosis}
              onChange={(e) => setPatternDiagnosis(e.target.value)}
            />
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
              {ZANG_FU_PATTERNS.slice(0, 24).map((p) => (
                <button
                  key={p}
                  onClick={() => setPatternDiagnosis(p)}
                  className={`text-xs px-2 py-1 rounded-md transition-colors ${
                    patternDiagnosis === p
                      ? 'bg-earth-300/20 text-earth-300 border border-earth-300/30'
                      : 'bg-dark-300 text-gray-400 hover:text-gray-300 border border-transparent'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <label className="input-label">Treatment Principles (optional)</label>
            <textarea
              className="input-field"
              rows={2}
              placeholder="Comma-separated: soothe Liver Qi, strengthen Spleen, nourish Blood..."
              value={treatmentPrinciples}
              onChange={(e) => setTreatmentPrinciples(e.target.value)}
            />
          </div>

          <div className="card">
            <label className="input-label">Additional Context</label>
            <textarea
              className="input-field"
              rows={2}
              placeholder="Patient age, mobility issues, needle sensitivity, previous treatments..."
              value={patientInfo}
              onChange={(e) => setPatientInfo(e.target.value)}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating || !patternDiagnosis.trim()}
            className="btn-cyan w-full py-3 text-base flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating Treatment Plan...
              </>
            ) : (
              'Generate AI Treatment Plan'
            )}
          </button>
        </div>

        {/* Right: Result */}
        <div className="space-y-6">
          {!result ? (
            <div className="card text-center py-16">
              <div className="text-4xl mb-3 opacity-30">⊹</div>
              <p className="text-gray-400">Enter a pattern diagnosis and generate a treatment plan</p>
            </div>
          ) : (
            <>
              {/* Clinical Reasoning */}
              {result.clinical_reasoning && (
                <div className="card border-earth-300/20">
                  <h3 className="text-sm font-medium text-earth-300 mb-2">Clinical Reasoning</h3>
                  <p className="text-sm text-gray-300">{result.clinical_reasoning}</p>
                </div>
              )}

              {/* Treatment Principles */}
              {result.treatment_principles?.length > 0 && (
                <div className="card">
                  <h3 className="text-sm font-medium text-white mb-2">Treatment Principles</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.treatment_principles.map((p, i) => (
                      <span key={i} className="badge-earth">{p}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Acupuncture Protocol */}
              {result.acupuncture_protocol?.length > 0 && (
                <div className="card">
                  <h3 className="text-sm font-medium text-white mb-4">Acupuncture Protocol</h3>
                  <div className="space-y-3">
                    {result.acupuncture_protocol.map((pt, idx) => (
                      <div key={idx} className="bg-dark-300 rounded-lg p-3 border border-dark-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-semibold">{pt.point}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              pt.technique === 'tonify' ? 'bg-emerald-500/10 text-emerald-400' :
                              pt.technique === 'sedate' ? 'bg-red-500/10 text-red-400' :
                              'bg-gray-500/10 text-gray-400'
                            }`}>
                              {pt.technique}
                            </span>
                            {pt.moxa && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">
                                Moxa {pt.moxa_method ? `(${pt.moxa_method})` : ''}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-1">{pt.location}</p>
                        <p className="text-xs text-gray-500 mb-1">Depth: {pt.needle_depth}</p>
                        <p className="text-sm text-gray-400">{pt.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Point Combinations */}
              {result.point_combinations?.length > 0 && (
                <div className="card border-cyan-400/20">
                  <h3 className="text-sm font-medium text-cyan-400 mb-3">Point Combinations</h3>
                  <div className="space-y-3">
                    {result.point_combinations.map((combo, idx) => (
                      <div key={idx} className="bg-dark-300 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-white font-medium">{combo.name}</span>
                          <div className="flex gap-1">
                            {combo.points.map((pt, i) => (
                              <span key={i} className="badge-cyan text-xs">{pt}</span>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-400">{combo.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Adjunct Therapies */}
              {result.adjunct_therapies && (
                <div className="card">
                  <h3 className="text-sm font-medium text-white mb-4">Adjunct Therapies</h3>
                  <div className="space-y-4">
                    {/* Cupping */}
                    {result.adjunct_therapies.cupping?.recommended && (
                      <div className="bg-dark-300 rounded-lg p-3 border border-dark-50">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-white font-medium">Cupping</span>
                          <span className="badge-earth text-xs">{result.adjunct_therapies.cupping.method}</span>
                        </div>
                        <p className="text-xs text-gray-400 mb-1">
                          Locations: {result.adjunct_therapies.cupping.locations.join(', ')}
                        </p>
                        <p className="text-xs text-gray-500">{result.adjunct_therapies.cupping.reasoning}</p>
                      </div>
                    )}

                    {/* Gua Sha */}
                    {result.adjunct_therapies.gua_sha?.recommended && (
                      <div className="bg-dark-300 rounded-lg p-3 border border-dark-50">
                        <span className="text-white font-medium block mb-2">Gua Sha</span>
                        <p className="text-xs text-gray-400 mb-1">
                          Areas: {result.adjunct_therapies.gua_sha.areas.join(', ')}
                        </p>
                        <p className="text-xs text-gray-500">{result.adjunct_therapies.gua_sha.reasoning}</p>
                      </div>
                    )}

                    {/* Ear Seeds */}
                    {result.adjunct_therapies.ear_seeds?.recommended && (
                      <div className="bg-dark-300 rounded-lg p-3 border border-dark-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">Ear Seeds</span>
                          <span className="text-xs text-gray-500">{result.adjunct_therapies.ear_seeds.duration}</span>
                        </div>
                        <div className="space-y-1">
                          {result.adjunct_therapies.ear_seeds.points.map((pt, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs">
                              <span className="text-earth-300">{pt.name}</span>
                              <span className="text-gray-500">— {pt.reasoning}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Electroacupuncture */}
                    {result.adjunct_therapies.electroacupuncture?.recommended && (
                      <div className="bg-dark-300 rounded-lg p-3 border border-dark-50">
                        <span className="text-white font-medium block mb-2">Electroacupuncture</span>
                        <div className="space-y-1">
                          {result.adjunct_therapies.electroacupuncture.pairs.map((pair, i) => (
                            <div key={i} className="text-xs text-gray-400">
                              {pair.point1} ↔ {pair.point2} at {pair.frequency} — {pair.reasoning}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No adjuncts */}
                    {!result.adjunct_therapies.cupping?.recommended &&
                     !result.adjunct_therapies.gua_sha?.recommended &&
                     !result.adjunct_therapies.ear_seeds?.recommended &&
                     !result.adjunct_therapies.electroacupuncture?.recommended && (
                      <p className="text-sm text-gray-500">No adjunct therapies recommended for this presentation.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Session Plan */}
              {result.session_plan && (
                <div className="card">
                  <h3 className="text-sm font-medium text-white mb-3">Session Plan</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xl font-bold text-white">{result.session_plan.retention_time}m</div>
                      <div className="text-xs text-gray-500">Retention</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{result.session_plan.frequency}</div>
                      <div className="text-xs text-gray-500">Frequency</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{result.session_plan.expected_sessions}</div>
                      <div className="text-xs text-gray-500">Expected</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cautions */}
              {result.cautions?.length > 0 && (
                <div className="card border-red-500/20">
                  <h3 className="text-sm font-medium text-red-400 mb-3">Cautions</h3>
                  <ul className="space-y-1">
                    {result.cautions.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-red-400 mt-0.5">•</span> {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving || !selectedPatientId}
                  className="btn-primary flex-1"
                >
                  {saving ? 'Saving...' : 'Accept & Save to Patient Record'}
                </button>
                <button
                  onClick={() => setResult(null)}
                  className="btn-secondary"
                >
                  Reject
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
