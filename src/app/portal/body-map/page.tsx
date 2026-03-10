'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { TriggerPoint, TriggerPointMap } from '@/lib/types';

const PAIN_TYPES = ['Sharp', 'Dull', 'Aching', 'Burning', 'Tingling', 'Numbness'];

interface PainMarker extends TriggerPoint {
  type: string;
}

function BodySVG({
  markers,
  onTap,
}: {
  markers: PainMarker[];
  onTap: (x: number, y: number) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  function handleClick(e: React.MouseEvent<SVGSVGElement>) {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onTap(Math.round(x * 10) / 10, Math.round(y * 10) / 10);
  }

  function getMarkerColor(intensity: number): string {
    if (intensity >= 8) return '#ef4444';
    if (intensity >= 5) return '#f59e0b';
    return '#22c55e';
  }

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 200 500"
      className="w-full max-w-[280px] mx-auto cursor-crosshair"
      onClick={handleClick}
    >
      {/* Background */}
      <rect width="200" height="500" fill="transparent" />

      {/* Human body outline - front view */}
      <g stroke="#3a3a3a" strokeWidth="1.5" fill="none">
        {/* Head */}
        <ellipse cx="100" cy="45" rx="25" ry="30" />
        {/* Neck */}
        <line x1="90" y1="75" x2="90" y2="95" />
        <line x1="110" y1="75" x2="110" y2="95" />
        {/* Shoulders */}
        <line x1="90" y1="95" x2="50" y2="110" />
        <line x1="110" y1="95" x2="150" y2="110" />
        {/* Left arm */}
        <line x1="50" y1="110" x2="40" y2="180" />
        <line x1="40" y1="180" x2="30" y2="250" />
        <line x1="30" y1="250" x2="25" y2="270" />
        {/* Left hand */}
        <ellipse cx="23" cy="275" rx="8" ry="12" />
        {/* Right arm */}
        <line x1="150" y1="110" x2="160" y2="180" />
        <line x1="160" y1="180" x2="170" y2="250" />
        <line x1="170" y1="250" x2="175" y2="270" />
        {/* Right hand */}
        <ellipse cx="177" cy="275" rx="8" ry="12" />
        {/* Torso left */}
        <line x1="65" y1="105" x2="60" y2="180" />
        <line x1="60" y1="180" x2="65" y2="260" />
        <line x1="65" y1="260" x2="70" y2="290" />
        {/* Torso right */}
        <line x1="135" y1="105" x2="140" y2="180" />
        <line x1="140" y1="180" x2="135" y2="260" />
        <line x1="135" y1="260" x2="130" y2="290" />
        {/* Hips */}
        <path d="M 70 290 Q 75 305 80 310" />
        <path d="M 130 290 Q 125 305 120 310" />
        {/* Left leg */}
        <line x1="80" y1="310" x2="75" y2="390" />
        <line x1="75" y1="390" x2="73" y2="440" />
        <line x1="73" y1="440" x2="65" y2="475" />
        {/* Left foot */}
        <path d="M 65 475 L 55 480 L 55 490 L 80 490 L 80 480 L 73 475" />
        {/* Right leg */}
        <line x1="120" y1="310" x2="125" y2="390" />
        <line x1="125" y1="390" x2="127" y2="440" />
        <line x1="127" y1="440" x2="135" y2="475" />
        {/* Right foot */}
        <path d="M 135 475 L 145 480 L 145 490 L 120 490 L 120 480 L 127 475" />
        {/* Center line (subtle) */}
        <line x1="100" y1="95" x2="100" y2="290" stroke="#2a2a2a" strokeWidth="0.5" strokeDasharray="4 4" />
      </g>

      {/* Body region labels */}
      <g fill="#555" fontSize="7" textAnchor="middle">
        <text x="100" y="45">Head</text>
        <text x="100" y="140">Chest</text>
        <text x="100" y="200">Abdomen</text>
        <text x="100" y="260">Lower</text>
        <text x="38" y="185">L Arm</text>
        <text x="162" y="185">R Arm</text>
        <text x="78" y="370">L Leg</text>
        <text x="122" y="370">R Leg</text>
      </g>

      {/* Pain markers */}
      {markers.map((marker, i) => {
        const cx = (marker.x / 100) * 200;
        const cy = (marker.y / 100) * 500;
        return (
          <g key={i}>
            <circle
              cx={cx}
              cy={cy}
              r={6 + marker.intensity * 0.5}
              fill={getMarkerColor(marker.intensity)}
              fillOpacity={0.4}
              stroke={getMarkerColor(marker.intensity)}
              strokeWidth={1.5}
            />
            <text
              x={cx}
              y={cy + 3}
              textAnchor="middle"
              fill="white"
              fontSize="8"
              fontWeight="bold"
            >
              {marker.intensity}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function PortalBodyMap() {
  const { profile } = useAppStore();
  const supabase = createClient();

  const [patientId, setPatientId] = useState<string | null>(null);
  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [markers, setMarkers] = useState<PainMarker[]>([]);
  const [history, setHistory] = useState<TriggerPointMap[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Edit state for a specific marker
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editIntensity, setEditIntensity] = useState(5);
  const [editType, setEditType] = useState('Aching');
  const [editNotes, setEditNotes] = useState('');

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

      const { data: maps } = await supabase
        .from('trigger_point_maps')
        .select('*')
        .eq('patient_id', patient.id)
        .order('created_at', { ascending: false })
        .limit(20);

      setHistory(maps || []);
    } catch (err) {
      console.error('Failed to load body map data:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleBodyTap(x: number, y: number) {
    const newMarker: PainMarker = {
      x,
      y,
      view: 'front',
      intensity: 5,
      type: 'Aching',
      notes: '',
    };
    setMarkers([...markers, newMarker]);
    setEditingIndex(markers.length);
    setEditIntensity(5);
    setEditType('Aching');
    setEditNotes('');
  }

  function saveMarkerEdit() {
    if (editingIndex === null) return;

    const updated = [...markers];
    updated[editingIndex] = {
      ...updated[editingIndex],
      intensity: editIntensity,
      type: editType,
      label: editType,
      notes: editNotes || undefined,
    };
    setMarkers(updated);
    setEditingIndex(null);
  }

  function removeMarker(index: number) {
    setMarkers(markers.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  }

  function clearAllMarkers() {
    setMarkers([]);
    setEditingIndex(null);
  }

  async function handleSubmit() {
    if (!patientId || !profile || markers.length === 0) return;

    setSubmitting(true);
    try {
      const points: TriggerPoint[] = markers.map((m) => ({
        x: m.x,
        y: m.y,
        view: 'front',
        intensity: m.intensity,
        label: m.type,
        notes: m.notes || undefined,
      }));

      const payload = {
        patient_id: patientId,
        practice_id: practiceId,
        submitted_by: profile.id,
        points,
        body_view: 'front',
        is_self_report: true,
      };

      const { error } = await supabase.from('trigger_point_maps').insert(payload);
      if (error) throw error;

      toast.success('Body map submitted!');
      setMarkers([]);
      setEditingIndex(null);

      // Reload
      const { data: maps } = await supabase
        .from('trigger_point_maps')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(20);

      setHistory(maps || []);
    } catch (err) {
      console.error('Failed to submit body map:', err);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
      <div>
        <h1 className="text-2xl font-bold text-white">Body Map</h1>
        <p className="text-gray-400 text-sm mt-1">
          Tap on the body to mark areas of pain or discomfort.
        </p>
      </div>

      {/* Body diagram */}
      <div className="portal-card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">Front View</h2>
          {markers.length > 0 && (
            <button onClick={clearAllMarkers} className="text-xs text-red-400 hover:text-red-300">
              Clear All
            </button>
          )}
        </div>
        <div className="bg-dark-300 rounded-xl p-4">
          <BodySVG markers={markers} onTap={handleBodyTap} />
        </div>
        <p className="text-xs text-gray-600 text-center mt-2">
          {markers.length === 0
            ? 'Tap on the body to add a pain marker'
            : `${markers.length} marker${markers.length !== 1 ? 's' : ''} placed`}
        </p>
      </div>

      {/* Marker editor */}
      {editingIndex !== null && markers[editingIndex] && (
        <div className="portal-card space-y-4 border-earth-300/30">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">
              Edit Marker #{editingIndex + 1}
            </h3>
            <button
              onClick={() => removeMarker(editingIndex)}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Remove
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="input-label mb-0">Intensity</label>
              <span className="text-sm font-semibold text-white">{editIntensity}</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={editIntensity}
              onChange={(e) => setEditIntensity(Number(e.target.value))}
              className="w-full h-2 rounded-full bg-dark-200 appearance-none cursor-pointer accent-[#D4A574]"
            />
            <div className="flex justify-between mt-0.5">
              <span className="text-[10px] text-gray-600">Mild</span>
              <span className="text-[10px] text-gray-600">Severe</span>
            </div>
          </div>

          <div>
            <label className="input-label">Type</label>
            <div className="grid grid-cols-3 gap-2">
              {PAIN_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setEditType(type)}
                  className={`px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                    editType === type
                      ? 'bg-earth-300/20 text-earth-300 border border-earth-300/40'
                      : 'bg-dark-300 text-gray-400 border border-dark-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="input-label">Notes (optional)</label>
            <input
              type="text"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Describe the sensation..."
              className="input-field"
            />
          </div>

          <button onClick={saveMarkerEdit} className="btn-primary w-full py-3 rounded-xl">
            Save Marker
          </button>
        </div>
      )}

      {/* Marker list */}
      {markers.length > 0 && editingIndex === null && (
        <div className="portal-card space-y-3">
          <h3 className="text-sm font-semibold text-white">Current Markers</h3>
          {markers.map((m, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b border-dark-50 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{
                    backgroundColor:
                      m.intensity >= 8
                        ? 'rgba(239,68,68,0.3)'
                        : m.intensity >= 5
                        ? 'rgba(245,158,11,0.3)'
                        : 'rgba(34,197,94,0.3)',
                  }}
                >
                  {m.intensity}
                </div>
                <div>
                  <p className="text-sm text-white">{m.type}</p>
                  {m.notes && <p className="text-xs text-gray-500">{m.notes}</p>}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingIndex(i);
                    setEditIntensity(m.intensity);
                    setEditType(m.type);
                    setEditNotes(m.notes || '');
                  }}
                  className="text-xs text-cyan-400 hover:text-cyan-300"
                >
                  Edit
                </button>
                <button
                  onClick={() => removeMarker(i)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="portal-btn bg-earth-300 hover:bg-earth-400 text-dark-700 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {submitting ? 'Submitting...' : 'Submit Body Map'}
          </button>
        </div>
      )}

      {/* Past submissions */}
      {history.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Past Submissions</h2>
          <div className="space-y-3">
            {history.map((map) => (
              <div key={map.id} className="portal-card">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-white">
                    {format(new Date(map.created_at), 'MMM d, yyyy \'at\' h:mm a')}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="badge-earth">
                      {map.points.length} point{map.points.length !== 1 ? 's' : ''}
                    </span>
                    {map.is_self_report && (
                      <span className="badge-warning">Self-report</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {map.points.map((pt, i) => (
                    <span
                      key={i}
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        pt.intensity >= 8
                          ? 'bg-red-500/10 text-red-400'
                          : pt.intensity >= 5
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-emerald-500/10 text-emerald-400'
                      }`}
                    >
                      {pt.label || 'Point'}: {pt.intensity}/10
                    </span>
                  ))}
                </div>
                {map.session_notes && (
                  <p className="text-xs text-gray-500 mt-2">{map.session_notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {history.length === 0 && markers.length === 0 && (
        <div className="portal-card text-center py-8">
          <svg className="w-10 h-10 text-gray-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          <p className="text-gray-400 text-sm">No body maps yet.</p>
          <p className="text-gray-500 text-xs mt-1">
            Tap the body diagram above to mark pain areas.
          </p>
        </div>
      )}
    </div>
  );
}
