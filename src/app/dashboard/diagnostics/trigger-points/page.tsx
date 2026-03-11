'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { TriggerPointMap, TriggerPoint } from '@/lib/types';

type PatientOption = { id: string; first_name: string; last_name: string };

type BodyView = 'front' | 'back';

function intensityColor(intensity: number): string {
  if (intensity <= 3) return '#22c55e';
  if (intensity <= 6) return '#eab308';
  return '#ef4444';
}

export default function TriggerPointsPage() {
  const { practice, profile } = useAppStore();
  const supabase = createClient();
  const svgRef = useRef<SVGSVGElement>(null);

  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [bodyView, setBodyView] = useState<BodyView>('front');
  const [points, setPoints] = useState<TriggerPoint[]>([]);
  const [selectedPointIdx, setSelectedPointIdx] = useState<number | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');

  // History
  const [history, setHistory] = useState<TriggerPointMap[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Sync indicator
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

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
      .from('trigger_point_maps')
      .select('*')
      .eq('patient_id', selectedPatientId)
      .order('created_at', { ascending: false })
      .limit(20);
    setHistory(data || []);
  }

  const handleSvgClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const svgWidth = 300;
      const svgHeight = 500;
      const x = ((e.clientX - rect.left) / rect.width) * svgWidth;
      const y = ((e.clientY - rect.top) / rect.height) * svgHeight;

      const newPoint: TriggerPoint = {
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
        view: bodyView,
        intensity: 5,
        label: '',
        notes: '',
      };
      setPoints((prev) => [...prev, newPoint]);
      setSelectedPointIdx(points.length);
    },
    [bodyView, points.length]
  );

  function updatePoint(idx: number, updates: Partial<TriggerPoint>) {
    setPoints((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, ...updates } : p))
    );
  }

  function deletePoint(idx: number) {
    setPoints((prev) => prev.filter((_, i) => i !== idx));
    setSelectedPointIdx(null);
  }

  async function handleSave() {
    if (!practice || !profile) return;
    if (!selectedPatientId) {
      toast.error('Please select a patient');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from('trigger_point_maps').insert({
        practice_id: practice.id,
        patient_id: selectedPatientId,
        submitted_by: profile.id,
        points,
        body_view: bodyView,
        is_self_report: false,
        session_notes: sessionNotes || null,
      });
      if (error) throw error;
      toast.success('Trigger point map saved');
      setLastSaved(new Date());
      loadHistory();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  function loadFromHistory(map: TriggerPointMap) {
    setPoints(map.points || []);
    setBodyView((map.body_view as BodyView) || 'front');
    setSessionNotes(map.session_notes || '');
    setShowHistory(false);
    setSelectedPointIdx(null);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _viewPoints = points.filter((p) => p.view === bodyView);
  const allViewPoints = points;

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
          <h1 className="text-2xl font-bold text-white">Trigger Point Map</h1>
          <p className="text-sm text-gray-400">Mark pain and trigger points on the body</p>
        </div>
        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Saved {format(lastSaved, 'h:mm a')}
            </span>
          )}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="btn-secondary text-sm"
          >
            {showHistory ? 'New Map' : 'View History'}
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Map'}
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
          <div className="text-4xl mb-3 opacity-30">&#9678;</div>
          <p className="text-gray-400">Select a patient to begin mapping trigger points</p>
        </div>
      ) : showHistory ? (
        /* History */
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">
            Map History ({history.length})
          </h2>
          {history.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-400">No previous trigger point maps for this patient.</p>
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
                      <p className="text-xs text-gray-500 mt-1">
                        {item.points.length} points marked
                        {' | '}View: {item.body_view}
                      </p>
                      {item.points.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.points
                            .filter((p: TriggerPoint) => p.label)
                            .slice(0, 5)
                            .map((p: TriggerPoint, i: number) => (
                              <span
                                key={i}
                                className="text-xs px-2 py-0.5 rounded"
                                style={{
                                  backgroundColor: `${intensityColor(p.intensity)}20`,
                                  color: intensityColor(p.intensity),
                                }}
                              >
                                {p.label} ({p.intensity}/10)
                              </span>
                            ))}
                        </div>
                      )}
                      {item.session_notes && (
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                          {item.session_notes}
                        </p>
                      )}
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
        /* Body Map + Points Panel */
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Body Map (2 cols) */}
          <div className="lg:col-span-2">
            {/* View tabs */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex bg-dark-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setBodyView('front')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    bodyView === 'front'
                      ? 'bg-earth-300/20 text-earth-300'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Front View
                </button>
                <button
                  onClick={() => setBodyView('back')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    bodyView === 'back'
                      ? 'bg-earth-300/20 text-earth-300'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Back View
                </button>
              </div>
              <span className="text-xs text-gray-500 ml-2">
                Click on the body to place a point
              </span>
            </div>

            <div className="card flex justify-center">
              <svg
                ref={svgRef}
                viewBox="0 0 300 500"
                className="w-full max-w-[400px] cursor-crosshair"
                onClick={handleSvgClick}
              >
                {/* Background */}
                <rect width="300" height="500" fill="transparent" />

                {bodyView === 'front' ? (
                  <g>
                    {/* Head */}
                    <ellipse cx="150" cy="45" rx="28" ry="34" fill="none" stroke="#3a3a3a" strokeWidth="1.5" />
                    {/* Neck */}
                    <rect x="140" y="78" width="20" height="18" fill="none" stroke="#3a3a3a" strokeWidth="1.2" rx="3" />
                    {/* Torso */}
                    <path
                      d="M105 96 L100 100 Q85 115, 82 150 L80 220 Q80 240, 95 250 L105 255 L110 280
                         L115 280 L130 260 L150 265 L170 260 L185 280 L190 280
                         L195 255 L205 250 Q220 240, 220 220 L218 150 Q215 115, 200 100 L195 96"
                      fill="none" stroke="#3a3a3a" strokeWidth="1.5"
                    />
                    {/* Chest line */}
                    <line x1="150" y1="100" x2="150" y2="260" stroke="#2a2a2a" strokeWidth="0.5" strokeDasharray="3,3" />
                    {/* Shoulder lines */}
                    <line x1="82" y1="100" x2="105" y2="96" stroke="#3a3a3a" strokeWidth="1.5" />
                    <line x1="218" y1="100" x2="195" y2="96" stroke="#3a3a3a" strokeWidth="1.5" />
                    {/* Left arm */}
                    <path
                      d="M82 105 Q60 115, 50 160 L42 215 Q38 230, 40 250 L38 280 Q36 290, 30 305"
                      fill="none" stroke="#3a3a3a" strokeWidth="1.5"
                    />
                    <path
                      d="M82 115 Q65 120, 58 160 L52 215 Q48 230, 50 250 L48 280 Q46 290, 42 305"
                      fill="none" stroke="#3a3a3a" strokeWidth="1.5"
                    />
                    {/* Left hand */}
                    <ellipse cx="35" cy="312" rx="10" ry="14" fill="none" stroke="#3a3a3a" strokeWidth="1.2" />
                    {/* Right arm */}
                    <path
                      d="M218 105 Q240 115, 250 160 L258 215 Q262 230, 260 250 L262 280 Q264 290, 270 305"
                      fill="none" stroke="#3a3a3a" strokeWidth="1.5"
                    />
                    <path
                      d="M218 115 Q235 120, 242 160 L248 215 Q252 230, 250 250 L252 280 Q254 290, 258 305"
                      fill="none" stroke="#3a3a3a" strokeWidth="1.5"
                    />
                    {/* Right hand */}
                    <ellipse cx="265" cy="312" rx="10" ry="14" fill="none" stroke="#3a3a3a" strokeWidth="1.2" />
                    {/* Abdomen marking */}
                    <ellipse cx="150" cy="210" rx="25" ry="15" fill="none" stroke="#2a2a2a" strokeWidth="0.5" strokeDasharray="3,3" />
                    {/* Left leg */}
                    <path
                      d="M115 280 Q110 290, 108 320 L105 370 Q102 400, 100 430 L98 455 Q96 470, 95 480"
                      fill="none" stroke="#3a3a3a" strokeWidth="1.5"
                    />
                    <path
                      d="M130 275 Q132 295, 130 320 L128 370 Q126 400, 125 430 L123 455 Q122 470, 120 480"
                      fill="none" stroke="#3a3a3a" strokeWidth="1.5"
                    />
                    {/* Left foot */}
                    <path d="M95 480 Q88 488, 85 490 L120 490 Q120 485, 120 480" fill="none" stroke="#3a3a3a" strokeWidth="1.2" />
                    {/* Right leg */}
                    <path
                      d="M185 280 Q190 290, 192 320 L195 370 Q198 400, 200 430 L202 455 Q204 470, 205 480"
                      fill="none" stroke="#3a3a3a" strokeWidth="1.5"
                    />
                    <path
                      d="M170 275 Q168 295, 170 320 L172 370 Q174 400, 175 430 L177 455 Q178 470, 180 480"
                      fill="none" stroke="#3a3a3a" strokeWidth="1.5"
                    />
                    {/* Right foot */}
                    <path d="M180 480 Q180 485, 180 490 L215 490 Q212 488, 205 480" fill="none" stroke="#3a3a3a" strokeWidth="1.2" />
                    {/* Labels */}
                    <text x="150" y="50" textAnchor="middle" fill="#555" fontSize="8">Head</text>
                    <text x="150" y="140" textAnchor="middle" fill="#555" fontSize="8">Chest</text>
                    <text x="150" y="215" textAnchor="middle" fill="#555" fontSize="8">Abdomen</text>
                    <text x="35" y="200" textAnchor="middle" fill="#555" fontSize="7">L.Arm</text>
                    <text x="265" y="200" textAnchor="middle" fill="#555" fontSize="7">R.Arm</text>
                    <text x="112" y="400" textAnchor="middle" fill="#555" fontSize="7">L.Leg</text>
                    <text x="192" y="400" textAnchor="middle" fill="#555" fontSize="7">R.Leg</text>
                  </g>
                ) : (
                  <g>
                    {/* Head */}
                    <ellipse cx="150" cy="45" rx="28" ry="34" fill="none" stroke="#3a3a3a" strokeWidth="1.5" />
                    {/* Neck */}
                    <rect x="140" y="78" width="20" height="18" fill="none" stroke="#3a3a3a" strokeWidth="1.2" rx="3" />
                    {/* Torso (back view) */}
                    <path
                      d="M105 96 L100 100 Q85 115, 82 150 L80 220 Q80 240, 95 250 L105 255 L110 280
                         L115 280 L130 260 L150 265 L170 260 L185 280 L190 280
                         L195 255 L205 250 Q220 240, 220 220 L218 150 Q215 115, 200 100 L195 96"
                      fill="none" stroke="#3a3a3a" strokeWidth="1.5"
                    />
                    {/* Spine */}
                    <line x1="150" y1="85" x2="150" y2="265" stroke="#3a3a3a" strokeWidth="1" strokeDasharray="4,2" />
                    {/* Scapula lines */}
                    <path d="M110 115 Q130 125, 142 140" fill="none" stroke="#2a2a2a" strokeWidth="0.8" />
                    <path d="M190 115 Q170 125, 158 140" fill="none" stroke="#2a2a2a" strokeWidth="0.8" />
                    {/* Shoulder lines */}
                    <line x1="82" y1="100" x2="105" y2="96" stroke="#3a3a3a" strokeWidth="1.5" />
                    <line x1="218" y1="100" x2="195" y2="96" stroke="#3a3a3a" strokeWidth="1.5" />
                    {/* Left arm */}
                    <path
                      d="M82 105 Q60 115, 50 160 L42 215 Q38 230, 40 250 L38 280 Q36 290, 30 305"
                      fill="none" stroke="#3a3a3a" strokeWidth="1.5"
                    />
                    <path
                      d="M82 115 Q65 120, 58 160 L52 215 Q48 230, 50 250 L48 280 Q46 290, 42 305"
                      fill="none" stroke="#3a3a3a" strokeWidth="1.5"
                    />
                    <ellipse cx="35" cy="312" rx="10" ry="14" fill="none" stroke="#3a3a3a" strokeWidth="1.2" />
                    {/* Right arm */}
                    <path
                      d="M218 105 Q240 115, 250 160 L258 215 Q262 230, 260 250 L262 280 Q264 290, 270 305"
                      fill="none" stroke="#3a3a3a" strokeWidth="1.5"
                    />
                    <path
                      d="M218 115 Q235 120, 242 160 L248 215 Q252 230, 250 250 L252 280 Q254 290, 258 305"
                      fill="none" stroke="#3a3a3a" strokeWidth="1.5"
                    />
                    <ellipse cx="265" cy="312" rx="10" ry="14" fill="none" stroke="#3a3a3a" strokeWidth="1.2" />
                    {/* Left leg */}
                    <path
                      d="M115 280 Q110 290, 108 320 L105 370 Q102 400, 100 430 L98 455 Q96 470, 95 480"
                      fill="none" stroke="#3a3a3a" strokeWidth="1.5"
                    />
                    <path
                      d="M130 275 Q132 295, 130 320 L128 370 Q126 400, 125 430 L123 455 Q122 470, 120 480"
                      fill="none" stroke="#3a3a3a" strokeWidth="1.5"
                    />
                    <path d="M95 480 Q88 488, 85 490 L120 490 Q120 485, 120 480" fill="none" stroke="#3a3a3a" strokeWidth="1.2" />
                    {/* Right leg */}
                    <path
                      d="M185 280 Q190 290, 192 320 L195 370 Q198 400, 200 430 L202 455 Q204 470, 205 480"
                      fill="none" stroke="#3a3a3a" strokeWidth="1.5"
                    />
                    <path
                      d="M170 275 Q168 295, 170 320 L172 370 Q174 400, 175 430 L177 455 Q178 470, 180 480"
                      fill="none" stroke="#3a3a3a" strokeWidth="1.5"
                    />
                    <path d="M180 480 Q180 485, 180 490 L215 490 Q212 488, 205 480" fill="none" stroke="#3a3a3a" strokeWidth="1.2" />
                    {/* Labels */}
                    <text x="150" y="50" textAnchor="middle" fill="#555" fontSize="8">Head</text>
                    <text x="150" y="90" textAnchor="middle" fill="#555" fontSize="8">Neck</text>
                    <text x="150" y="135" textAnchor="middle" fill="#555" fontSize="8">Upper Back</text>
                    <text x="150" y="215" textAnchor="middle" fill="#555" fontSize="8">Lower Back</text>
                    <text x="35" y="200" textAnchor="middle" fill="#555" fontSize="7">L.Arm</text>
                    <text x="265" y="200" textAnchor="middle" fill="#555" fontSize="7">R.Arm</text>
                    <text x="112" y="400" textAnchor="middle" fill="#555" fontSize="7">L.Leg</text>
                    <text x="192" y="400" textAnchor="middle" fill="#555" fontSize="7">R.Leg</text>
                  </g>
                )}

                {/* Trigger point markers for current view */}
                {points.map((point, idx) => {
                  if (point.view !== bodyView) return null;
                  const isSelected = selectedPointIdx === idx;
                  return (
                    <g
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPointIdx(isSelected ? null : idx);
                      }}
                      className="cursor-pointer"
                    >
                      {/* Outer glow */}
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r={isSelected ? 14 : 10}
                        fill={`${intensityColor(point.intensity)}20`}
                        stroke="none"
                      />
                      {/* Main circle */}
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r={7}
                        fill={intensityColor(point.intensity)}
                        stroke={isSelected ? '#fff' : 'none'}
                        strokeWidth={isSelected ? 2 : 0}
                        opacity={0.9}
                      />
                      {/* Intensity number */}
                      <text
                        x={point.x}
                        y={point.y + 3}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize="8"
                        fontWeight="700"
                      >
                        {point.intensity}
                      </text>
                      {/* Label */}
                      {point.label && (
                        <text
                          x={point.x}
                          y={point.y - 12}
                          textAnchor="middle"
                          fill="#ccc"
                          fontSize="7"
                        >
                          {point.label}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Right Panel: Point Details + List + Notes */}
          <div className="space-y-4">
            {/* Selected Point Popover */}
            {selectedPointIdx !== null && points[selectedPointIdx] && (
              <div className="card border-cyan-400/20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-cyan-400">
                    Point #{selectedPointIdx + 1}
                  </h3>
                  <button
                    onClick={() => deletePoint(selectedPointIdx)}
                    className="btn-danger text-xs py-1 px-2"
                  >
                    Delete
                  </button>
                </div>

                {/* Label */}
                <div className="mb-3">
                  <label className="input-label">Label</label>
                  <input
                    className="input-field text-sm"
                    placeholder='e.g., "GB-21 area", "Lower back"'
                    value={points[selectedPointIdx].label || ''}
                    onChange={(e) =>
                      updatePoint(selectedPointIdx, { label: e.target.value })
                    }
                  />
                </div>

                {/* Intensity Slider */}
                <div className="mb-3">
                  <label className="input-label">
                    Intensity:{' '}
                    <span
                      style={{ color: intensityColor(points[selectedPointIdx].intensity) }}
                      className="font-semibold"
                    >
                      {points[selectedPointIdx].intensity}/10
                    </span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={points[selectedPointIdx].intensity}
                    onChange={(e) =>
                      updatePoint(selectedPointIdx, {
                        intensity: parseInt(e.target.value),
                      })
                    }
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #22c55e, #eab308, #ef4444)`,
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>Mild</span>
                    <span>Moderate</span>
                    <span>Severe</span>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="input-label">Notes</label>
                  <textarea
                    className="input-field text-sm"
                    rows={3}
                    placeholder="Observations about this point..."
                    value={points[selectedPointIdx].notes || ''}
                    onChange={(e) =>
                      updatePoint(selectedPointIdx, { notes: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            {/* Point List */}
            <div className="card">
              <h3 className="text-sm font-semibold text-white mb-3">
                Marked Points ({allViewPoints.length})
              </h3>
              {allViewPoints.length === 0 ? (
                <p className="text-xs text-gray-500">
                  Click on the body diagram to add trigger points.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {allViewPoints.map((point, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedPointIdx === idx
                          ? 'bg-dark-200 border border-cyan-400/20'
                          : 'hover:bg-dark-300'
                      }`}
                      onClick={() => {
                        setSelectedPointIdx(idx);
                        if (point.view !== bodyView) setBodyView(point.view as BodyView);
                      }}
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: intensityColor(point.intensity) }}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white truncate">
                          {point.label || `Point #${idx + 1}`}
                        </p>
                        <p className="text-xs text-gray-600">
                          {point.view} view | Intensity: {point.intensity}/10
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Session Notes */}
            <div className="card">
              <h3 className="text-sm font-semibold text-white mb-3">Session Notes</h3>
              <textarea
                className="input-field text-sm"
                rows={4}
                placeholder="Session observations, pain patterns, treatment notes..."
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
              />
            </div>

            {/* Point count summary */}
            <div className="card bg-dark-500">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Front view points</span>
                <span className="text-gray-300">
                  {points.filter((p) => p.view === 'front').length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-500">Back view points</span>
                <span className="text-gray-300">
                  {points.filter((p) => p.view === 'back').length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1 pt-1 border-t border-dark-50">
                <span className="text-gray-500">Total</span>
                <span className="text-white font-medium">{points.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
