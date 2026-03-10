'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  TONGUE_BODY_COLORS,
  TONGUE_BODY_SHAPES,
  TONGUE_COATING_COLORS,
  TONGUE_COATING_THICKNESS,
  TONGUE_MOISTURE,
} from '@/lib/tcm-data';
import type { TongueAnalysis } from '@/lib/types';

type PatientOption = { id: string; first_name: string; last_name: string };

const TONGUE_REGIONS = [
  { key: 'tip', label: 'Tip', organ: 'Heart / Lung', cx: 150, cy: 55 },
  { key: 'left', label: 'Left', organ: 'Liver / Gallbladder', cx: 80, cy: 130 },
  { key: 'right', label: 'Right', organ: 'Lung / Large Intestine', cx: 220, cy: 130 },
  { key: 'center', label: 'Center', organ: 'Stomach / Spleen', cx: 150, cy: 150 },
  { key: 'root', label: 'Root', organ: 'Kidney / Bladder', cx: 150, cy: 240 },
];

export default function TongueAnalysisPage() {
  const { practice, profile } = useAppStore();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Manual annotation form
  const [bodyColor, setBodyColor] = useState('');
  const [bodyShape, setBodyShape] = useState('');
  const [coatingColor, setCoatingColor] = useState('');
  const [coatingThickness, setCoatingThickness] = useState('');
  const [moisture, setMoisture] = useState('');

  // Region notes
  const [regionNotes, setRegionNotes] = useState<Record<string, string>>({});
  const [activeRegion, setActiveRegion] = useState<string | null>(null);

  // AI analysis
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [aiPatterns, setAiPatterns] = useState<string[]>([]);

  // Notes
  const [practitionerNotes, setPractitionerNotes] = useState('');

  // History
  const [history, setHistory] = useState<TongueAnalysis[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [compareIdx, setCompareIdx] = useState<number | null>(null);

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
      .from('tongue_analyses')
      .select('*')
      .eq('patient_id', selectedPatientId)
      .order('created_at', { ascending: false })
      .limit(20);
    setHistory(data || []);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function uploadImage(): Promise<string | null> {
    if (!imageFile || !practice) return null;
    const ext = imageFile.name.split('.').pop();
    const path = `${practice.id}/tongue/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from('diagnostics')
      .upload(path, imageFile);
    if (error) {
      toast.error('Failed to upload image');
      return null;
    }
    const { data } = supabase.storage.from('diagnostics').getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleAiAnalysis() {
    if (!imagePreview) {
      toast.error('Please upload a tongue image first');
      return;
    }
    setAnalyzing(true);
    try {
      const imageUrl = await uploadImage();
      if (!imageUrl) {
        setAnalyzing(false);
        return;
      }
      const res = await fetch('/api/diagnostics/tongue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: imageUrl,
          patient_id: selectedPatientId || undefined,
        }),
      });
      if (!res.ok) throw new Error('AI analysis failed');
      const result = await res.json();
      setAiAnalysis(result.analysis || '');
      setAiPatterns(result.patterns || []);
      // Auto-fill form from AI suggestions if available
      if (result.body_color) setBodyColor(result.body_color);
      if (result.body_shape) setBodyShape(result.body_shape);
      if (result.coating_color) setCoatingColor(result.coating_color);
      if (result.coating_thickness) setCoatingThickness(result.coating_thickness);
      if (result.moisture) setMoisture(result.moisture);
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
      let imageUrl = '';
      if (imageFile) {
        const url = await uploadImage();
        if (url) imageUrl = url;
      }
      const { error } = await supabase.from('tongue_analyses').insert({
        practice_id: practice.id,
        patient_id: selectedPatientId,
        submitted_by: profile.id,
        image_url: imageUrl,
        body_color: bodyColor || null,
        body_shape: bodyShape || null,
        coating_color: coatingColor || null,
        coating_thickness: coatingThickness || null,
        moisture: moisture || null,
        regions: regionNotes,
        ai_analysis: aiAnalysis || null,
        ai_patterns: aiPatterns,
        practitioner_notes: practitionerNotes || null,
        is_self_assessment: false,
      });
      if (error) throw error;
      toast.success('Tongue analysis saved');
      resetForm();
      loadHistory();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setImagePreview(null);
    setImageFile(null);
    setBodyColor('');
    setBodyShape('');
    setCoatingColor('');
    setCoatingThickness('');
    setMoisture('');
    setRegionNotes({});
    setActiveRegion(null);
    setAiAnalysis('');
    setAiPatterns([]);
    setPractitionerNotes('');
  }

  function loadFromHistory(analysis: TongueAnalysis) {
    setBodyColor(analysis.body_color || '');
    setBodyShape(analysis.body_shape || '');
    setCoatingColor(analysis.coating_color || '');
    setCoatingThickness(analysis.coating_thickness || '');
    setMoisture(analysis.moisture || '');
    setRegionNotes(analysis.regions || {});
    setAiAnalysis(analysis.ai_analysis || '');
    setAiPatterns(analysis.ai_patterns || []);
    setPractitionerNotes(analysis.practitioner_notes || '');
    if (analysis.image_url) setImagePreview(analysis.image_url);
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
          <h1 className="text-2xl font-bold text-white">Tongue Analysis</h1>
          <p className="text-sm text-gray-400">Examine and record tongue characteristics</p>
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
          <div className="text-4xl mb-3 opacity-30">&#9673;</div>
          <p className="text-gray-400">Select a patient to begin tongue analysis</p>
        </div>
      ) : showHistory ? (
        /* History View */
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">
            Analysis History ({history.length})
          </h2>
          {history.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-400">No previous tongue analyses for this patient.</p>
            </div>
          ) : (
            <div>
              {/* Comparison Toggle */}
              {compareIdx !== null && (
                <div className="card mb-4">
                  <h3 className="text-sm font-medium text-earth-300 mb-3">Side-by-Side Comparison</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-gray-500 mb-2">
                        {format(new Date(history[compareIdx].created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                      {history[compareIdx].image_url && (
                        <img
                          src={history[compareIdx].image_url}
                          alt="Tongue"
                          className="w-full rounded-lg mb-3 max-h-48 object-cover"
                        />
                      )}
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-300">
                          <span className="text-gray-500">Body:</span> {history[compareIdx].body_color || '—'} / {history[compareIdx].body_shape || '—'}
                        </p>
                        <p className="text-gray-300">
                          <span className="text-gray-500">Coating:</span> {history[compareIdx].coating_color || '—'} / {history[compareIdx].coating_thickness || '—'}
                        </p>
                        <p className="text-gray-300">
                          <span className="text-gray-500">Moisture:</span> {history[compareIdx].moisture || '—'}
                        </p>
                      </div>
                    </div>
                    {compareIdx + 1 < history.length && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">
                          {format(new Date(history[compareIdx + 1].created_at), 'MMM d, yyyy h:mm a')}
                        </p>
                        {history[compareIdx + 1].image_url && (
                          <img
                            src={history[compareIdx + 1].image_url}
                            alt="Tongue"
                            className="w-full rounded-lg mb-3 max-h-48 object-cover"
                          />
                        )}
                        <div className="space-y-1 text-sm">
                          <p className="text-gray-300">
                            <span className="text-gray-500">Body:</span> {history[compareIdx + 1].body_color || '—'} / {history[compareIdx + 1].body_shape || '—'}
                          </p>
                          <p className="text-gray-300">
                            <span className="text-gray-500">Coating:</span> {history[compareIdx + 1].coating_color || '—'} / {history[compareIdx + 1].coating_thickness || '—'}
                          </p>
                          <p className="text-gray-300">
                            <span className="text-gray-500">Moisture:</span> {history[compareIdx + 1].moisture || '—'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setCompareIdx(null)}
                    className="text-xs text-gray-500 hover:text-gray-300 mt-3"
                  >
                    Close comparison
                  </button>
                </div>
              )}

              {/* Timeline */}
              <div className="space-y-3">
                {history.map((item, idx) => (
                  <div key={item.id} className="card-hover" onClick={() => loadFromHistory(item)}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt="Tongue"
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-dark-300 flex items-center justify-center flex-shrink-0">
                            <span className="text-gray-600 text-2xl">&#9673;</span>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-white">
                            {format(new Date(item.created_at), 'MMM d, yyyy h:mm a')}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {item.body_color && <span className="badge-earth">{item.body_color}</span>}
                            {item.body_shape && <span className="badge-earth">{item.body_shape}</span>}
                            {item.coating_color && <span className="badge-cyan">{item.coating_color} coating</span>}
                            {item.moisture && <span className="badge-cyan">{item.moisture}</span>}
                          </div>
                          {item.ai_patterns.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.ai_patterns.map((p, i) => (
                                <span key={i} className="badge-warning">{p}</span>
                              ))}
                            </div>
                          )}
                          {item.practitioner_notes && (
                            <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                              {item.practitioner_notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCompareIdx(idx);
                          }}
                          className="text-xs text-cyan-400 hover:text-cyan-300"
                          title="Compare with next"
                        >
                          Compare
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* New Analysis Form */
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column: Image + Tongue Map */}
          <div className="space-y-6">
            {/* Camera/Upload */}
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-4">Tongue Image</h2>
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Tongue preview"
                    className="w-full rounded-lg max-h-64 object-cover"
                  />
                  <button
                    onClick={() => {
                      setImagePreview(null);
                      setImageFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="absolute top-2 right-2 bg-dark-700/80 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-dark-700"
                  >
                    X
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-dark-50 rounded-lg p-12 text-center cursor-pointer hover:border-earth-300/30 transition-colors"
                >
                  <div className="text-4xl text-gray-600 mb-3">&#128247;</div>
                  <p className="text-gray-400 text-sm">Click to upload or take a photo</p>
                  <p className="text-gray-600 text-xs mt-1">Supports JPG, PNG</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleImageChange}
              />
              <div className="mt-4">
                <button
                  onClick={handleAiAnalysis}
                  disabled={analyzing || !imagePreview}
                  className="btn-cyan w-full flex items-center justify-center gap-2"
                >
                  {analyzing ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    'Run AI Analysis'
                  )}
                </button>
              </div>
            </div>

            {/* Tongue Region Map */}
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-4">Tongue Region Mapping</h2>
              <p className="text-xs text-gray-500 mb-3">Click a region to add observations</p>
              <div className="flex justify-center">
                <svg viewBox="0 0 300 320" className="w-64 h-80">
                  {/* Tongue outline */}
                  <path
                    d="M150 20
                       C 90 20, 40 70, 35 140
                       C 30 200, 60 270, 100 295
                       C 120 310, 140 315, 150 315
                       C 160 315, 180 310, 200 295
                       C 240 270, 270 200, 265 140
                       C 260 70, 210 20, 150 20 Z"
                    fill="#3a2525"
                    stroke="#5a3a3a"
                    strokeWidth="2"
                  />
                  {/* Center line */}
                  <line
                    x1="150" y1="40" x2="150" y2="300"
                    stroke="#5a3a3a" strokeWidth="0.5" strokeDasharray="4,4"
                  />
                  {/* Horizontal dividers */}
                  <line
                    x1="60" y1="100" x2="240" y2="100"
                    stroke="#5a3a3a" strokeWidth="0.5" strokeDasharray="4,4"
                  />
                  <line
                    x1="45" y1="190" x2="255" y2="190"
                    stroke="#5a3a3a" strokeWidth="0.5" strokeDasharray="4,4"
                  />

                  {/* Clickable regions */}
                  {TONGUE_REGIONS.map((region) => {
                    const isActive = activeRegion === region.key;
                    const hasNotes = !!regionNotes[region.key];
                    return (
                      <g
                        key={region.key}
                        onClick={() => setActiveRegion(isActive ? null : region.key)}
                        className="cursor-pointer"
                      >
                        <circle
                          cx={region.cx}
                          cy={region.cy}
                          r={28}
                          fill={isActive ? 'rgba(0, 240, 255, 0.15)' : hasNotes ? 'rgba(212, 165, 116, 0.15)' : 'rgba(255,255,255,0.05)'}
                          stroke={isActive ? '#00F0FF' : hasNotes ? '#D4A574' : '#5a3a3a'}
                          strokeWidth={isActive ? 2 : 1}
                          className="transition-all duration-200"
                        />
                        <text
                          x={region.cx}
                          y={region.cy - 6}
                          textAnchor="middle"
                          fill={isActive ? '#00F0FF' : '#ccc'}
                          fontSize="11"
                          fontWeight="600"
                        >
                          {region.label}
                        </text>
                        <text
                          x={region.cx}
                          y={region.cy + 9}
                          textAnchor="middle"
                          fill="#888"
                          fontSize="8"
                        >
                          {region.organ}
                        </text>
                        {hasNotes && (
                          <circle
                            cx={region.cx + 20}
                            cy={region.cy - 20}
                            r={4}
                            fill="#D4A574"
                          />
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Region note editor */}
              {activeRegion && (
                <div className="mt-4 p-4 bg-dark-300 rounded-lg border border-dark-50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-cyan-400">
                      {TONGUE_REGIONS.find((r) => r.key === activeRegion)?.label} Region
                      <span className="text-gray-500 ml-1 font-normal">
                        ({TONGUE_REGIONS.find((r) => r.key === activeRegion)?.organ})
                      </span>
                    </h3>
                    <button
                      onClick={() => setActiveRegion(null)}
                      className="text-xs text-gray-500 hover:text-gray-300"
                    >
                      Close
                    </button>
                  </div>
                  <textarea
                    className="input-field text-sm"
                    rows={3}
                    placeholder="Notes for this region..."
                    value={regionNotes[activeRegion] || ''}
                    onChange={(e) =>
                      setRegionNotes({ ...regionNotes, [activeRegion]: e.target.value })
                    }
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Form + AI Results + Notes */}
          <div className="space-y-6">
            {/* Manual Annotation */}
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-4">Manual Annotation</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Body Color</label>
                  <select
                    className="input-field"
                    value={bodyColor}
                    onChange={(e) => setBodyColor(e.target.value)}
                  >
                    <option value="">Select...</option>
                    {TONGUE_BODY_COLORS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="input-label">Body Shape</label>
                  <select
                    className="input-field"
                    value={bodyShape}
                    onChange={(e) => setBodyShape(e.target.value)}
                  >
                    <option value="">Select...</option>
                    {TONGUE_BODY_SHAPES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="input-label">Coating Color</label>
                  <select
                    className="input-field"
                    value={coatingColor}
                    onChange={(e) => setCoatingColor(e.target.value)}
                  >
                    <option value="">Select...</option>
                    {TONGUE_COATING_COLORS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="input-label">Coating Thickness</label>
                  <select
                    className="input-field"
                    value={coatingThickness}
                    onChange={(e) => setCoatingThickness(e.target.value)}
                  >
                    <option value="">Select...</option>
                    {TONGUE_COATING_THICKNESS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="input-label">Moisture</label>
                  <select
                    className="input-field"
                    value={moisture}
                    onChange={(e) => setMoisture(e.target.value)}
                  >
                    <option value="">Select...</option>
                    {TONGUE_MOISTURE.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* AI Analysis Results */}
            {(aiAnalysis || aiPatterns.length > 0) && (
              <div className="card border-cyan-400/20">
                <h2 className="text-lg font-semibold text-cyan-400 mb-3">
                  AI Analysis Results
                </h2>
                {aiPatterns.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-2">Detected Patterns</p>
                    <div className="flex flex-wrap gap-2">
                      {aiPatterns.map((p, i) => (
                        <span key={i} className="badge-warning">{p}</span>
                      ))}
                    </div>
                  </div>
                )}
                {aiAnalysis && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Analysis Details</p>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{aiAnalysis}</p>
                  </div>
                )}
              </div>
            )}

            {/* Practitioner Notes */}
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-3">Practitioner Notes</h2>
              <textarea
                className="input-field"
                rows={5}
                placeholder="Clinical observations, interpretations, notes..."
                value={practitionerNotes}
                onChange={(e) => setPractitionerNotes(e.target.value)}
              />
            </div>

            {/* Quick summary */}
            <div className="card bg-dark-500">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Current Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Body</span>
                  <span className="text-gray-300">{bodyColor || '—'} / {bodyShape || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Coating</span>
                  <span className="text-gray-300">{coatingColor || '—'} / {coatingThickness || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Moisture</span>
                  <span className="text-gray-300">{moisture || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Regions noted</span>
                  <span className="text-gray-300">
                    {Object.keys(regionNotes).filter((k) => regionNotes[k]).length} / 5
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
