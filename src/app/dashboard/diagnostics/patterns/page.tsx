'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  EIGHT_PRINCIPLES,
  ZANG_FU_PATTERNS,
  QI_BLOOD_FLUID_PATTERNS,
} from '@/lib/tcm-data';
import type { PatternDifferentiation } from '@/lib/types';

type PatientOption = { id: string; first_name: string; last_name: string };

export default function PatternDifferentiationPage() {
  const { practice, profile } = useAppStore();
  const supabase = createClient();

  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // Symptoms and Signs (tag inputs)
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [symptomInput, setSymptomInput] = useState('');
  const [signs, setSigns] = useState<string[]>([]);
  const [signInput, setSignInput] = useState('');

  // Eight Principles
  const [eightPrinciples, setEightPrinciples] = useState<{
    yin_yang?: string;
    interior_exterior?: string;
    cold_heat?: string;
    deficiency_excess?: string;
  }>({});

  // Zang-Fu Patterns
  const [zangFuPatterns, setZangFuPatterns] = useState<string[]>([]);
  const [zangFuSearch, setZangFuSearch] = useState('');
  const [showZangFuDropdown, setShowZangFuDropdown] = useState(false);

  // Qi/Blood/Fluid Patterns
  const [qiBloodFluid, setQiBloodFluid] = useState<string[]>([]);

  // Additional differentiations
  const [sixStages, setSixStages] = useState('');
  const [fourLevels, setFourLevels] = useState('');
  const [sanJiao, setSanJiao] = useState('');

  // Primary/secondary patterns
  const [primaryPattern, setPrimaryPattern] = useState('');
  const [primaryPatternSearch, setPrimaryPatternSearch] = useState('');
  const [showPrimaryDropdown, setShowPrimaryDropdown] = useState(false);
  const [secondaryPatterns, setSecondaryPatterns] = useState<string[]>([]);
  const [secondarySearch, setSecondarySearch] = useState('');
  const [showSecondaryDropdown, setShowSecondaryDropdown] = useState(false);

  // Treatment principles (tag input)
  const [treatmentPrinciples, setTreatmentPrinciples] = useState<string[]>([]);
  const [treatmentInput, setTreatmentInput] = useState('');

  // AI
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);

  // Notes
  const [practitionerNotes, setPractitionerNotes] = useState('');

  // Related analyses IDs
  const [tongueAnalysisId, setTongueAnalysisId] = useState('');
  const [pulseDiagnosisId, setPulseDiagnosisId] = useState('');

  // History
  const [history, setHistory] = useState<PatternDifferentiation[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Refs for dropdown outside click
  const zangFuRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLDivElement>(null);
  const secondaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!practice) return;
    loadPatients();
  }, [practice]);

  useEffect(() => {
    if (!selectedPatientId || !practice) return;
    loadHistory();
  }, [selectedPatientId, practice]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (zangFuRef.current && !zangFuRef.current.contains(e.target as Node)) {
        setShowZangFuDropdown(false);
      }
      if (primaryRef.current && !primaryRef.current.contains(e.target as Node)) {
        setShowPrimaryDropdown(false);
      }
      if (secondaryRef.current && !secondaryRef.current.contains(e.target as Node)) {
        setShowSecondaryDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

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
      .from('pattern_differentiations')
      .select('*')
      .eq('patient_id', selectedPatientId)
      .order('created_at', { ascending: false })
      .limit(20);
    setHistory(data || []);
  }

  // Tag input helpers
  function addTag(
    value: string,
    list: string[],
    setList: (v: string[]) => void,
    setInput: (v: string) => void
  ) {
    const trimmed = value.trim();
    if (trimmed && !list.includes(trimmed)) {
      setList([...list, trimmed]);
    }
    setInput('');
  }

  function removeTag(tag: string, list: string[], setList: (v: string[]) => void) {
    setList(list.filter((t) => t !== tag));
  }

  function handleTagKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    value: string,
    list: string[],
    setList: (v: string[]) => void,
    setInput: (v: string) => void
  ) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(value, list, setList, setInput);
    }
    if (e.key === 'Backspace' && !value && list.length > 0) {
      setList(list.slice(0, -1));
    }
  }

  // Filtered pattern lists
  const filteredZangFu = ZANG_FU_PATTERNS.filter(
    (p) =>
      p.toLowerCase().includes(zangFuSearch.toLowerCase()) &&
      !zangFuPatterns.includes(p)
  );

  const filteredPrimary = ZANG_FU_PATTERNS.filter((p) =>
    p.toLowerCase().includes(primaryPatternSearch.toLowerCase())
  );

  const filteredSecondary = ZANG_FU_PATTERNS.filter(
    (p) =>
      p.toLowerCase().includes(secondarySearch.toLowerCase()) &&
      !secondaryPatterns.includes(p)
  );

  async function handleAiAnalysis() {
    if (!selectedPatientId) {
      toast.error('Please select a patient');
      return;
    }
    setAnalyzing(true);
    try {
      const res = await fetch('/api/diagnostics/patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: selectedPatientId,
          symptoms,
          signs,
          eight_principles: eightPrinciples,
          zang_fu_patterns: zangFuPatterns,
          qi_blood_fluid: qiBloodFluid,
          tongue_analysis_id: tongueAnalysisId || undefined,
          pulse_diagnosis_id: pulseDiagnosisId || undefined,
        }),
      });
      if (!res.ok) throw new Error('AI analysis failed');
      const result = await res.json();
      setAiAnalysis(result.analysis || '');
      setAiConfidence(result.confidence || null);
      if (result.primary_pattern) setPrimaryPattern(result.primary_pattern);
      if (result.secondary_patterns) setSecondaryPatterns(result.secondary_patterns);
      if (result.treatment_principles) setTreatmentPrinciples(result.treatment_principles);
      toast.success('AI analysis complete');
    } catch {
      toast.error('AI analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleSave() {
    if (!practice || !profile) return;
    if (!selectedPatientId) {
      toast.error('Please select a patient');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from('pattern_differentiations').insert({
        practice_id: practice.id,
        patient_id: selectedPatientId,
        practitioner_id: profile.id,
        tongue_analysis_id: tongueAnalysisId || null,
        pulse_diagnosis_id: pulseDiagnosisId || null,
        symptoms,
        signs,
        primary_pattern: primaryPattern || null,
        secondary_patterns: secondaryPatterns,
        eight_principles: eightPrinciples,
        zang_fu_patterns: zangFuPatterns,
        qi_blood_fluid: qiBloodFluid,
        six_stages: sixStages || null,
        four_levels: fourLevels || null,
        san_jiao: sanJiao || null,
        ai_analysis: aiAnalysis || null,
        ai_confidence: aiConfidence,
        practitioner_notes: practitionerNotes || null,
        treatment_principles: treatmentPrinciples,
      });
      if (error) throw error;
      toast.success('Pattern differentiation saved');
      loadHistory();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  function loadFromHistory(item: PatternDifferentiation) {
    setSymptoms(item.symptoms || []);
    setSigns(item.signs || []);
    setEightPrinciples(item.eight_principles || {});
    setZangFuPatterns(item.zang_fu_patterns || []);
    setQiBloodFluid(item.qi_blood_fluid || []);
    setSixStages(item.six_stages || '');
    setFourLevels(item.four_levels || '');
    setSanJiao(item.san_jiao || '');
    setPrimaryPattern(item.primary_pattern || '');
    setSecondaryPatterns(item.secondary_patterns || []);
    setTreatmentPrinciples(item.treatment_principles || []);
    setAiAnalysis(item.ai_analysis || '');
    setAiConfidence(item.ai_confidence || null);
    setPractitionerNotes(item.practitioner_notes || '');
    setTongueAnalysisId(item.tongue_analysis_id || '');
    setPulseDiagnosisId(item.pulse_diagnosis_id || '');
    setShowHistory(false);
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
          <h1 className="text-2xl font-bold text-white">Pattern Differentiation</h1>
          <p className="text-sm text-gray-400">TCM diagnostic pattern analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="btn-secondary text-sm"
          >
            {showHistory ? 'New Analysis' : 'View History'}
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Analysis'}
          </button>
        </div>
      </div>

      {/* Patient Selector */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-md">
            <label className="input-label">Select Patient</label>
            <select
              className="input-field"
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
          {/* Links to related analyses */}
          {selectedPatientId && (
            <div className="flex gap-2 ml-4">
              <Link
                href="/dashboard/diagnostics/tongue"
                className="text-xs text-cyan-400 hover:text-cyan-300"
              >
                Tongue Analysis
              </Link>
              <span className="text-gray-600">|</span>
              <Link
                href="/dashboard/diagnostics/pulse"
                className="text-xs text-cyan-400 hover:text-cyan-300"
              >
                Pulse Diagnosis
              </Link>
            </div>
          )}
        </div>
      </div>

      {!selectedPatientId ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3 opacity-30">&#11041;</div>
          <p className="text-gray-400">Select a patient to begin pattern differentiation</p>
        </div>
      ) : showHistory ? (
        /* History View */
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">
            History ({history.length})
          </h2>
          {history.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-400">No previous pattern differentiations for this patient.</p>
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
                      {item.primary_pattern && (
                        <p className="text-sm text-earth-300 mt-1">
                          Primary: {item.primary_pattern}
                        </p>
                      )}
                      {item.secondary_patterns.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.secondary_patterns.map((p, i) => (
                            <span key={i} className="badge-earth">{p}</span>
                          ))}
                        </div>
                      )}
                      {item.zang_fu_patterns.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.zang_fu_patterns.slice(0, 4).map((p, i) => (
                            <span key={i} className="badge-cyan">{p}</span>
                          ))}
                          {item.zang_fu_patterns.length > 4 && (
                            <span className="text-xs text-gray-600">
                              +{item.zang_fu_patterns.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                      {item.treatment_principles.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          Tx: {item.treatment_principles.join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.ai_confidence != null && (
                        <span className="badge-success text-xs">
                          AI: {Math.round(item.ai_confidence * 100)}%
                        </span>
                      )}
                      <span className="text-xs text-cyan-400">Load</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Differentiation Form */
        <div className="space-y-6">
          {/* Symptoms & Signs */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Symptoms */}
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-3">Symptoms</h2>
              <p className="text-xs text-gray-500 mb-2">
                Patient-reported complaints. Press Enter or comma to add.
              </p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {symptoms.map((s) => (
                  <span
                    key={s}
                    className="badge-earth flex items-center gap-1"
                  >
                    {s}
                    <button
                      onClick={() => removeTag(s, symptoms, setSymptoms)}
                      className="text-earth-300/60 hover:text-earth-300 ml-0.5"
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
              <input
                className="input-field text-sm"
                placeholder="Type a symptom and press Enter..."
                value={symptomInput}
                onChange={(e) => setSymptomInput(e.target.value)}
                onKeyDown={(e) =>
                  handleTagKeyDown(e, symptomInput, symptoms, setSymptoms, setSymptomInput)
                }
                onBlur={() => {
                  if (symptomInput.trim()) addTag(symptomInput, symptoms, setSymptoms, setSymptomInput);
                }}
              />
            </div>

            {/* Signs */}
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-3">Signs</h2>
              <p className="text-xs text-gray-500 mb-2">
                Practitioner-observed findings. Press Enter or comma to add.
              </p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {signs.map((s) => (
                  <span
                    key={s}
                    className="badge-cyan flex items-center gap-1"
                  >
                    {s}
                    <button
                      onClick={() => removeTag(s, signs, setSigns)}
                      className="text-cyan-400/60 hover:text-cyan-400 ml-0.5"
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
              <input
                className="input-field text-sm"
                placeholder="Type a sign and press Enter..."
                value={signInput}
                onChange={(e) => setSignInput(e.target.value)}
                onKeyDown={(e) =>
                  handleTagKeyDown(e, signInput, signs, setSigns, setSignInput)
                }
                onBlur={() => {
                  if (signInput.trim()) addTag(signInput, signs, setSigns, setSignInput);
                }}
              />
            </div>
          </div>

          {/* Eight Principles */}
          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-4">Eight Principles (Ba Gang)</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Yin/Yang */}
              <div>
                <label className="input-label">Yin / Yang</label>
                <div className="space-y-2 mt-1">
                  {EIGHT_PRINCIPLES.yin_yang.map((opt) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="yin_yang"
                        value={opt}
                        checked={eightPrinciples.yin_yang === opt}
                        onChange={() =>
                          setEightPrinciples({ ...eightPrinciples, yin_yang: opt })
                        }
                        className="accent-earth-300"
                      />
                      <span className="text-sm text-gray-300">{opt}</span>
                    </label>
                  ))}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="yin_yang"
                      checked={!eightPrinciples.yin_yang}
                      onChange={() =>
                        setEightPrinciples({ ...eightPrinciples, yin_yang: undefined })
                      }
                      className="accent-gray-500"
                    />
                    <span className="text-sm text-gray-500">Undetermined</span>
                  </label>
                </div>
              </div>

              {/* Interior/Exterior */}
              <div>
                <label className="input-label">Interior / Exterior</label>
                <div className="space-y-2 mt-1">
                  {EIGHT_PRINCIPLES.interior_exterior.map((opt) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="interior_exterior"
                        value={opt}
                        checked={eightPrinciples.interior_exterior === opt}
                        onChange={() =>
                          setEightPrinciples({ ...eightPrinciples, interior_exterior: opt })
                        }
                        className="accent-earth-300"
                      />
                      <span className="text-sm text-gray-300">{opt}</span>
                    </label>
                  ))}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="interior_exterior"
                      checked={!eightPrinciples.interior_exterior}
                      onChange={() =>
                        setEightPrinciples({ ...eightPrinciples, interior_exterior: undefined })
                      }
                      className="accent-gray-500"
                    />
                    <span className="text-sm text-gray-500">Undetermined</span>
                  </label>
                </div>
              </div>

              {/* Cold/Heat */}
              <div>
                <label className="input-label">Cold / Heat</label>
                <div className="space-y-2 mt-1">
                  {EIGHT_PRINCIPLES.cold_heat.map((opt) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="cold_heat"
                        value={opt}
                        checked={eightPrinciples.cold_heat === opt}
                        onChange={() =>
                          setEightPrinciples({ ...eightPrinciples, cold_heat: opt })
                        }
                        className="accent-earth-300"
                      />
                      <span className="text-sm text-gray-300">{opt}</span>
                    </label>
                  ))}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="cold_heat"
                      checked={!eightPrinciples.cold_heat}
                      onChange={() =>
                        setEightPrinciples({ ...eightPrinciples, cold_heat: undefined })
                      }
                      className="accent-gray-500"
                    />
                    <span className="text-sm text-gray-500">Undetermined</span>
                  </label>
                </div>
              </div>

              {/* Deficiency/Excess */}
              <div>
                <label className="input-label">Deficiency / Excess</label>
                <div className="space-y-2 mt-1">
                  {EIGHT_PRINCIPLES.deficiency_excess.map((opt) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="deficiency_excess"
                        value={opt}
                        checked={eightPrinciples.deficiency_excess === opt}
                        onChange={() =>
                          setEightPrinciples({ ...eightPrinciples, deficiency_excess: opt })
                        }
                        className="accent-earth-300"
                      />
                      <span className="text-sm text-gray-300">{opt}</span>
                    </label>
                  ))}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="deficiency_excess"
                      checked={!eightPrinciples.deficiency_excess}
                      onChange={() =>
                        setEightPrinciples({ ...eightPrinciples, deficiency_excess: undefined })
                      }
                      className="accent-gray-500"
                    />
                    <span className="text-sm text-gray-500">Undetermined</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Zang-Fu Patterns */}
          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-3">Zang-Fu Patterns</h2>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {zangFuPatterns.map((p) => (
                <span key={p} className="badge-earth flex items-center gap-1">
                  {p}
                  <button
                    onClick={() =>
                      setZangFuPatterns(zangFuPatterns.filter((x) => x !== p))
                    }
                    className="text-earth-300/60 hover:text-earth-300 ml-0.5"
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
            <div ref={zangFuRef} className="relative">
              <input
                className="input-field text-sm"
                placeholder="Search Zang-Fu patterns..."
                value={zangFuSearch}
                onChange={(e) => {
                  setZangFuSearch(e.target.value);
                  setShowZangFuDropdown(true);
                }}
                onFocus={() => setShowZangFuDropdown(true)}
              />
              {showZangFuDropdown && zangFuSearch && filteredZangFu.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-dark-400 border border-dark-50 rounded-lg max-h-48 overflow-y-auto shadow-xl">
                  {filteredZangFu.slice(0, 15).map((p) => (
                    <button
                      key={p}
                      className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-dark-300 hover:text-white transition-colors"
                      onClick={() => {
                        setZangFuPatterns([...zangFuPatterns, p]);
                        setZangFuSearch('');
                        setShowZangFuDropdown(false);
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Qi/Blood/Fluid Patterns */}
          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-3">
              Qi, Blood &amp; Fluid Patterns
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {QI_BLOOD_FLUID_PATTERNS.map((p) => {
                const isSelected = qiBloodFluid.includes(p);
                return (
                  <label
                    key={p}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-cyan-400/10 border border-cyan-400/20'
                        : 'border border-transparent hover:bg-dark-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        if (isSelected) {
                          setQiBloodFluid(qiBloodFluid.filter((x) => x !== p));
                        } else {
                          setQiBloodFluid([...qiBloodFluid, p]);
                        }
                      }}
                      className="accent-cyan-400"
                    />
                    <span className="text-sm text-gray-300">{p}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Six Stages, Four Levels, San Jiao */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card">
              <label className="input-label">Six Stages (Liu Jing)</label>
              <input
                className="input-field text-sm"
                placeholder="e.g., Tai Yang, Shao Yang..."
                value={sixStages}
                onChange={(e) => setSixStages(e.target.value)}
              />
            </div>
            <div className="card">
              <label className="input-label">Four Levels (Wei Qi Ying Xue)</label>
              <input
                className="input-field text-sm"
                placeholder="e.g., Wei level, Qi level..."
                value={fourLevels}
                onChange={(e) => setFourLevels(e.target.value)}
              />
            </div>
            <div className="card">
              <label className="input-label">San Jiao</label>
              <input
                className="input-field text-sm"
                placeholder="e.g., Upper Jiao, Middle Jiao..."
                value={sanJiao}
                onChange={(e) => setSanJiao(e.target.value)}
              />
            </div>
          </div>

          {/* Primary & Secondary Patterns */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Primary Pattern */}
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-3">Primary Pattern</h2>
              <div ref={primaryRef} className="relative">
                <input
                  className="input-field text-sm"
                  placeholder="Type or search for primary pattern..."
                  value={primaryPattern || primaryPatternSearch}
                  onChange={(e) => {
                    setPrimaryPattern('');
                    setPrimaryPatternSearch(e.target.value);
                    setShowPrimaryDropdown(true);
                  }}
                  onFocus={() => setShowPrimaryDropdown(true)}
                />
                {showPrimaryDropdown && primaryPatternSearch && (
                  <div className="absolute z-20 left-0 right-0 mt-1 bg-dark-400 border border-dark-50 rounded-lg max-h-48 overflow-y-auto shadow-xl">
                    {filteredPrimary.slice(0, 10).map((p) => (
                      <button
                        key={p}
                        className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-dark-300 hover:text-white transition-colors"
                        onClick={() => {
                          setPrimaryPattern(p);
                          setPrimaryPatternSearch('');
                          setShowPrimaryDropdown(false);
                        }}
                      >
                        {p}
                      </button>
                    ))}
                    {/* Allow free-text */}
                    {primaryPatternSearch &&
                      !filteredPrimary.includes(primaryPatternSearch) && (
                        <button
                          className="w-full text-left px-3 py-2 text-sm text-earth-300 hover:bg-dark-300 transition-colors border-t border-dark-50"
                          onClick={() => {
                            setPrimaryPattern(primaryPatternSearch);
                            setPrimaryPatternSearch('');
                            setShowPrimaryDropdown(false);
                          }}
                        >
                          Use &quot;{primaryPatternSearch}&quot;
                        </button>
                      )}
                  </div>
                )}
              </div>
              {primaryPattern && (
                <div className="mt-2">
                  <span className="badge-earth">{primaryPattern}</span>
                </div>
              )}
            </div>

            {/* Secondary Patterns */}
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-3">Secondary Patterns</h2>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {secondaryPatterns.map((p) => (
                  <span key={p} className="badge-cyan flex items-center gap-1">
                    {p}
                    <button
                      onClick={() =>
                        setSecondaryPatterns(secondaryPatterns.filter((x) => x !== p))
                      }
                      className="text-cyan-400/60 hover:text-cyan-400 ml-0.5"
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
              <div ref={secondaryRef} className="relative">
                <input
                  className="input-field text-sm"
                  placeholder="Search secondary patterns..."
                  value={secondarySearch}
                  onChange={(e) => {
                    setSecondarySearch(e.target.value);
                    setShowSecondaryDropdown(true);
                  }}
                  onFocus={() => setShowSecondaryDropdown(true)}
                />
                {showSecondaryDropdown && secondarySearch && filteredSecondary.length > 0 && (
                  <div className="absolute z-20 left-0 right-0 mt-1 bg-dark-400 border border-dark-50 rounded-lg max-h-48 overflow-y-auto shadow-xl">
                    {filteredSecondary.slice(0, 10).map((p) => (
                      <button
                        key={p}
                        className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-dark-300 hover:text-white transition-colors"
                        onClick={() => {
                          setSecondaryPatterns([...secondaryPatterns, p]);
                          setSecondarySearch('');
                          setShowSecondaryDropdown(false);
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Treatment Principles */}
          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-3">Treatment Principles</h2>
            <p className="text-xs text-gray-500 mb-2">
              Press Enter or comma to add treatment principles.
            </p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {treatmentPrinciples.map((t) => (
                <span key={t} className="badge-success flex items-center gap-1">
                  {t}
                  <button
                    onClick={() =>
                      removeTag(t, treatmentPrinciples, setTreatmentPrinciples)
                    }
                    className="text-emerald-400/60 hover:text-emerald-400 ml-0.5"
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
            <input
              className="input-field text-sm"
              placeholder='e.g., "Tonify Qi", "Clear Heat and Resolve Damp"...'
              value={treatmentInput}
              onChange={(e) => setTreatmentInput(e.target.value)}
              onKeyDown={(e) =>
                handleTagKeyDown(
                  e,
                  treatmentInput,
                  treatmentPrinciples,
                  setTreatmentPrinciples,
                  setTreatmentInput
                )
              }
              onBlur={() => {
                if (treatmentInput.trim())
                  addTag(treatmentInput, treatmentPrinciples, setTreatmentPrinciples, setTreatmentInput);
              }}
            />
          </div>

          {/* AI Analysis */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">AI Analysis</h2>
              <button
                onClick={handleAiAnalysis}
                disabled={analyzing}
                className="btn-cyan text-sm flex items-center gap-2"
              >
                {analyzing ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  'Run AI Analysis'
                )}
              </button>
            </div>
            {aiAnalysis ? (
              <div>
                {aiConfidence != null && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 bg-dark-300 rounded-full h-2">
                      <div
                        className="bg-cyan-400 h-2 rounded-full transition-all"
                        style={{ width: `${Math.round(aiConfidence * 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-cyan-400">
                      {Math.round(aiConfidence * 100)}% confidence
                    </span>
                  </div>
                )}
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{aiAnalysis}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Add symptoms, signs, and pattern selections, then run AI analysis for diagnostic suggestions.
              </p>
            )}
          </div>

          {/* Practitioner Notes */}
          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-3">Practitioner Notes</h2>
            <textarea
              className="input-field"
              rows={4}
              placeholder="Clinical reasoning, additional observations..."
              value={practitionerNotes}
              onChange={(e) => setPractitionerNotes(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
