'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { ZANG_FU_PATTERNS } from '@/lib/tcm-data';

type PatientOption = { id: string; first_name: string; last_name: string };

interface HerbEntry {
  pin_yin: string;
  english: string;
  latin: string;
  dosage: number;
  unit: string;
  role: string;
  role_label: string;
  reasoning: string;
  is_modification: boolean;
}

interface Modification {
  action: string;
  herb: string;
  reasoning: string;
}

interface PrescriptionResult {
  base_formula?: {
    name: string;
    english_name: string;
    source_text: string;
    original_actions: string;
  };
  herbs?: HerbEntry[];
  modifications?: Modification[];
  contraindication_warnings?: string[];
  herb_interactions?: string[];
  pregnancy_warnings?: string[];
  preparation_method?: string;
  dosage_instructions?: string;
  clinical_reasoning?: string;
  treatment_principles?: string[];
  saved_formula?: { id: string };
}

export default function HerbalAIPage() {
  const { practice } = useAppStore();
  const supabase = createClient();

  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Input form
  const [patternDiagnosis, setPatternDiagnosis] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [contraindications, setContraindications] = useState('');
  const [patientInfo, setPatientInfo] = useState('');

  // Result
  const [result, setResult] = useState<PrescriptionResult | null>(null);
  const [editedHerbs, setEditedHerbs] = useState<HerbEntry[]>([]);
  const [saving, setSaving] = useState(false);

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
      const res = await fetch('/api/diagnostics/herbal-prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pattern_diagnosis: patternDiagnosis,
          symptoms: symptoms.split(',').map((s) => s.trim()).filter(Boolean),
          contraindications: contraindications.split(',').map((s) => s.trim()).filter(Boolean),
          patient_info: patientInfo || undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to generate prescription');
      const data = await res.json();
      setResult(data);
      setEditedHerbs(data.herbs || []);
      toast.success('Prescription generated');
    } catch {
      toast.error('Failed to generate prescription');
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!result || !practice || !selectedPatientId) {
      toast.error('Select a patient to save the prescription');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/diagnostics/herbal-prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pattern_diagnosis: patternDiagnosis,
          symptoms: symptoms.split(',').map((s) => s.trim()).filter(Boolean),
          contraindications: contraindications.split(',').map((s) => s.trim()).filter(Boolean),
          patient_info: patientInfo || undefined,
          patient_id: selectedPatientId,
          practice_id: practice.id,
          save: true,
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success('Prescription saved to patient record');
    } catch {
      toast.error('Failed to save prescription');
    } finally {
      setSaving(false);
    }
  }

  function updateHerbDosage(index: number, dosage: number) {
    const updated = [...editedHerbs];
    updated[index] = { ...updated[index], dosage };
    setEditedHerbs(updated);
  }

  function removeHerb(index: number) {
    setEditedHerbs(editedHerbs.filter((_, i) => i !== index));
  }

  const roleColors: Record<string, string> = {
    jun: 'text-amber-400 bg-amber-400/10',
    chen: 'text-earth-300 bg-earth-300/10',
    zuo: 'text-cyan-400 bg-cyan-400/10',
    shi: 'text-gray-400 bg-gray-400/10',
  };

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
          <h1 className="text-2xl font-bold text-white">AI Herbal Prescriber</h1>
          <p className="text-sm text-gray-400">Generate classical formula suggestions based on pattern diagnosis</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-6">
        <p className="text-xs text-amber-400">
          AI-generated suggestions are for clinical decision support only. All prescriptions must be reviewed and approved by a qualified TCM practitioner before dispensing. Exercise independent clinical judgment.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Input */}
        <div className="space-y-6">
          {/* Patient Selector */}
          <div className="card">
            <label className="input-label">Patient (optional for generation, required for saving)</label>
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

          {/* Pattern Diagnosis */}
          <div className="card">
            <label className="input-label">Pattern Diagnosis *</label>
            <div className="mb-3">
              <input
                className="input-field"
                placeholder="e.g. Liver Qi Stagnation with Blood Deficiency"
                value={patternDiagnosis}
                onChange={(e) => setPatternDiagnosis(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ZANG_FU_PATTERNS.slice(0, 20).map((p) => (
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
              <button
                onClick={() => {
                  const el = document.getElementById('pattern-expand');
                  if (el) el.classList.toggle('hidden');
                }}
                className="text-xs px-2 py-1 rounded-md bg-dark-300 text-cyan-400 hover:text-cyan-300"
              >
                Show all...
              </button>
            </div>
            <div id="pattern-expand" className="hidden mt-2 flex flex-wrap gap-1.5">
              {ZANG_FU_PATTERNS.slice(20).map((p) => (
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

          {/* Symptoms */}
          <div className="card">
            <label className="input-label">Presenting Symptoms</label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="Comma-separated: irritability, headache, rib-side distension, pale complexion..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
            />
          </div>

          {/* Contraindications */}
          <div className="card">
            <label className="input-label">Contraindications / Allergies</label>
            <textarea
              className="input-field"
              rows={2}
              placeholder="Comma-separated: pregnancy, blood thinners, shellfish allergy..."
              value={contraindications}
              onChange={(e) => setContraindications(e.target.value)}
            />
          </div>

          {/* Additional Info */}
          <div className="card">
            <label className="input-label">Additional Patient Context</label>
            <textarea
              className="input-field"
              rows={2}
              placeholder="Age, constitution, concurrent conditions, previous formulas tried..."
              value={patientInfo}
              onChange={(e) => setPatientInfo(e.target.value)}
            />
          </div>

          {/* Generate Button */}
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
                Generating Prescription...
              </>
            ) : (
              'Generate AI Prescription'
            )}
          </button>
        </div>

        {/* Right: Result */}
        <div className="space-y-6">
          {!result ? (
            <div className="card text-center py-16">
              <div className="text-4xl mb-3 opacity-30">❋</div>
              <p className="text-gray-400">Enter a pattern diagnosis and generate a prescription</p>
            </div>
          ) : (
            <>
              {/* Base Formula */}
              {result.base_formula && (
                <div className="card border-earth-300/20">
                  <h2 className="text-lg font-semibold text-earth-300 mb-2">
                    {result.base_formula.name}
                  </h2>
                  <p className="text-sm text-gray-300 mb-1">{result.base_formula.english_name}</p>
                  <p className="text-xs text-gray-500 mb-2">Source: {result.base_formula.source_text}</p>
                  <p className="text-sm text-gray-400">{result.base_formula.original_actions}</p>
                </div>
              )}

              {/* Clinical Reasoning */}
              {result.clinical_reasoning && (
                <div className="card">
                  <h3 className="text-sm font-medium text-white mb-2">Clinical Reasoning</h3>
                  <p className="text-sm text-gray-300">{result.clinical_reasoning}</p>
                </div>
              )}

              {/* Treatment Principles */}
              {result.treatment_principles && result.treatment_principles.length > 0 && (
                <div className="card">
                  <h3 className="text-sm font-medium text-white mb-2">Treatment Principles</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.treatment_principles.map((p, i) => (
                      <span key={i} className="badge-earth">{p}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Herbs Table */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white">Formula Composition</h3>
                  <div className="flex gap-2 text-xs">
                    <span className="text-amber-400">Jun</span>
                    <span className="text-earth-300">Chen</span>
                    <span className="text-cyan-400">Zuo</span>
                    <span className="text-gray-400">Shi</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-dark-50">
                        <th className="table-header">Pin Yin</th>
                        <th className="table-header">English / Latin</th>
                        <th className="table-header">Role</th>
                        <th className="table-header">Dosage</th>
                        <th className="table-header w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {editedHerbs.map((herb, idx) => (
                        <tr key={idx} className={`border-b border-dark-100 ${herb.is_modification ? 'bg-cyan-400/5' : ''}`}>
                          <td className="table-cell">
                            <span className="text-white font-medium">{herb.pin_yin}</span>
                            {herb.is_modification && (
                              <span className="ml-1.5 text-xs text-cyan-400">+mod</span>
                            )}
                          </td>
                          <td className="table-cell">
                            <div className="text-gray-300 text-xs">{herb.english}</div>
                            <div className="text-gray-500 text-xs italic">{herb.latin}</div>
                          </td>
                          <td className="table-cell">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[herb.role] || 'text-gray-400'}`}>
                              {herb.role_label || herb.role}
                            </span>
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                className="w-16 bg-dark-300 border border-dark-50 rounded px-2 py-1 text-sm text-white text-center"
                                value={herb.dosage}
                                onChange={(e) => updateHerbDosage(idx, parseFloat(e.target.value) || 0)}
                                min={0}
                                step={1}
                              />
                              <span className="text-xs text-gray-500">{herb.unit}</span>
                            </div>
                          </td>
                          <td className="table-cell">
                            <button
                              onClick={() => removeHerb(idx)}
                              className="text-red-400/50 hover:text-red-400 text-sm"
                              title="Remove herb"
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modifications */}
              {result.modifications && result.modifications.length > 0 && (
                <div className="card">
                  <h3 className="text-sm font-medium text-white mb-3">Modifications from Base Formula</h3>
                  <div className="space-y-2">
                    {result.modifications.map((mod, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          mod.action === 'add' ? 'bg-emerald-500/10 text-emerald-400' :
                          mod.action === 'remove' ? 'bg-red-500/10 text-red-400' :
                          mod.action === 'increase' ? 'bg-cyan-400/10 text-cyan-400' :
                          'bg-amber-500/10 text-amber-400'
                        }`}>
                          {mod.action}
                        </span>
                        <div>
                          <span className="text-white">{mod.herb}</span>
                          <span className="text-gray-500 ml-2">— {mod.reasoning}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preparation & Dosage */}
              <div className="card">
                <h3 className="text-sm font-medium text-white mb-3">Preparation & Dosage</h3>
                {result.preparation_method && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Preparation</p>
                    <p className="text-sm text-gray-300">{result.preparation_method}</p>
                  </div>
                )}
                {result.dosage_instructions && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Dosage</p>
                    <p className="text-sm text-gray-300">{result.dosage_instructions}</p>
                  </div>
                )}
              </div>

              {/* Warnings */}
              {((result.contraindication_warnings && result.contraindication_warnings.length > 0) ||
                (result.pregnancy_warnings && result.pregnancy_warnings.length > 0) ||
                (result.herb_interactions && result.herb_interactions.length > 0)) && (
                <div className="card border-red-500/20">
                  <h3 className="text-sm font-medium text-red-400 mb-3">Warnings & Interactions</h3>
                  {result.contraindication_warnings && result.contraindication_warnings.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Contraindications</p>
                      <ul className="text-sm text-gray-300 space-y-1">
                        {result.contraindication_warnings.map((w, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-red-400 mt-0.5">•</span> {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.pregnancy_warnings && result.pregnancy_warnings.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Pregnancy Warnings</p>
                      <ul className="text-sm text-gray-300 space-y-1">
                        {result.pregnancy_warnings.map((w, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-amber-400 mt-0.5">•</span> {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.herb_interactions && result.herb_interactions.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Herb-Herb Interactions</p>
                      <ul className="text-sm text-gray-300 space-y-1">
                        {result.herb_interactions.map((w, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-cyan-400 mt-0.5">•</span> {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving || !selectedPatientId}
                  className="btn-primary flex-1"
                >
                  {saving ? 'Saving...' : 'Accept & Save to Patient Record'}
                </button>
                <button
                  onClick={() => { setResult(null); setEditedHerbs([]); }}
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
