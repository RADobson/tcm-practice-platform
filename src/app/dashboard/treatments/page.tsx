'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { TreatmentRecord, AcupuncturePoint } from '@/lib/types';
import { COMMON_ACUPUNCTURE_POINTS } from '@/lib/tcm-data';

type PatientOption = { id: string; first_name: string; last_name: string };
type FormulaOption = { id: string; name: string; chinese_name?: string };

const TECHNIQUES = ['Tonify', 'Sedate', 'Even', 'Through'];
const SENSATIONS = ['De Qi achieved', 'Mild', 'Strong'];

interface ModalityState {
  moxa: boolean;
  cupping: boolean;
  tuina: boolean;
  electroacupuncture: boolean;
  gua_sha: boolean;
}

const emptyForm = {
  patient_id: '',
  treatment_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  needle_technique: '',
  retention_time: 20,
  moxa_applied: false,
  moxa_details: '',
  cupping_applied: false,
  cupping_details: '',
  tuina_applied: false,
  tuina_details: '',
  electroacupuncture: false,
  electroacupuncture_details: '',
  gua_sha: false,
  gua_sha_details: '',
  herbal_formula_id: '',
  herbal_notes: '',
  dietary_advice: '',
  exercise_recommendations: '',
  lifestyle_notes: '',
  follow_up_plan: '',
  patient_response: '',
};

export default function TreatmentsPage() {
  const { practice, profile } = useAppStore();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [treatments, setTreatments] = useState<TreatmentRecord[]>([]);
  const [formulas, setFormulas] = useState<FormulaOption[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState('');

  // Form state
  const [form, setForm] = useState({ ...emptyForm });
  const [selectedPoints, setSelectedPoints] = useState<AcupuncturePoint[]>([]);
  const [pointSearch, setPointSearch] = useState('');
  const [pointDropdownOpen, setPointDropdownOpen] = useState(false);

  // Modality toggles
  const [modalities, setModalities] = useState<ModalityState>({
    moxa: false,
    cupping: false,
    tuina: false,
    electroacupuncture: false,
    gua_sha: false,
  });

  useEffect(() => {
    if (!practice) return;
    loadPatients();
  }, [practice]);

  useEffect(() => {
    if (!practice || !selectedPatientId) return;
    loadTreatments();
  }, [practice, selectedPatientId]);

  useEffect(() => {
    if (!practice) return;
    loadFormulas();
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

  async function loadTreatments() {
    const { data } = await supabase
      .from('treatment_records')
      .select('*')
      .eq('practice_id', practice!.id)
      .eq('patient_id', selectedPatientId)
      .order('treatment_date', { ascending: false });
    setTreatments(data || []);
  }

  async function loadFormulas() {
    const { data } = await supabase
      .from('herbal_formulas')
      .select('id, name, chinese_name')
      .eq('practice_id', practice!.id)
      .order('name');
    setFormulas(data || []);
  }

  // Point search filtering
  const filteredPoints = useMemo(() => {
    if (!pointSearch.trim()) return COMMON_ACUPUNCTURE_POINTS.slice(0, 20);
    const q = pointSearch.toLowerCase();
    return COMMON_ACUPUNCTURE_POINTS.filter(p => p.toLowerCase().includes(q));
  }, [pointSearch]);

  function addPoint(pointName: string) {
    if (selectedPoints.find(sp => sp.point === pointName)) return;
    setSelectedPoints([...selectedPoints, {
      point: pointName,
      technique: 'Even',
      retention_time: 20,
      sensation: 'De Qi achieved',
    }]);
    setPointSearch('');
    setPointDropdownOpen(false);
  }

  function removePoint(pointName: string) {
    setSelectedPoints(selectedPoints.filter(sp => sp.point !== pointName));
  }

  function updatePoint(pointName: string, field: keyof AcupuncturePoint, value: string | number) {
    setSelectedPoints(selectedPoints.map(sp =>
      sp.point === pointName ? { ...sp, [field]: value } : sp
    ));
  }

  function resetForm() {
    setForm({ ...emptyForm });
    setSelectedPoints([]);
    setModalities({ moxa: false, cupping: false, tuina: false, electroacupuncture: false, gua_sha: false });
    setEditingId(null);
  }

  function loadTreatmentIntoForm(t: TreatmentRecord) {
    setForm({
      patient_id: t.patient_id,
      treatment_date: t.treatment_date ? format(new Date(t.treatment_date), "yyyy-MM-dd'T'HH:mm") : '',
      needle_technique: t.needle_technique || '',
      retention_time: t.retention_time || 20,
      moxa_applied: t.moxa_applied,
      moxa_details: t.moxa_details || '',
      cupping_applied: t.cupping_applied,
      cupping_details: t.cupping_details || '',
      tuina_applied: t.tuina_applied,
      tuina_details: t.tuina_details || '',
      electroacupuncture: t.electroacupuncture,
      electroacupuncture_details: t.electroacupuncture_details || '',
      gua_sha: t.gua_sha,
      gua_sha_details: t.gua_sha_details || '',
      herbal_formula_id: t.herbal_formula_id || '',
      herbal_notes: t.herbal_notes || '',
      dietary_advice: t.dietary_advice || '',
      exercise_recommendations: t.exercise_recommendations || '',
      lifestyle_notes: t.lifestyle_notes || '',
      follow_up_plan: t.follow_up_plan || '',
      patient_response: t.patient_response || '',
    });
    setSelectedPoints(t.acupuncture_points || []);
    setModalities({
      moxa: t.moxa_applied,
      cupping: t.cupping_applied,
      tuina: t.tuina_applied,
      electroacupuncture: t.electroacupuncture,
      gua_sha: t.gua_sha,
    });
    setEditingId(t.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const patientId = form.patient_id || selectedPatientId;
    if (!patientId) {
      toast.error('Please select a patient');
      return;
    }

    const record = {
      practice_id: practice!.id,
      practitioner_id: profile!.id,
      patient_id: patientId,
      treatment_date: new Date(form.treatment_date).toISOString(),
      acupuncture_points: selectedPoints,
      needle_technique: form.needle_technique || null,
      retention_time: form.retention_time || null,
      moxa_applied: modalities.moxa,
      moxa_details: modalities.moxa ? form.moxa_details : null,
      cupping_applied: modalities.cupping,
      cupping_details: modalities.cupping ? form.cupping_details : null,
      tuina_applied: modalities.tuina,
      tuina_details: modalities.tuina ? form.tuina_details : null,
      electroacupuncture: modalities.electroacupuncture,
      electroacupuncture_details: modalities.electroacupuncture ? form.electroacupuncture_details : null,
      gua_sha: modalities.gua_sha,
      gua_sha_details: modalities.gua_sha ? form.gua_sha_details : null,
      herbal_formula_id: form.herbal_formula_id || null,
      herbal_notes: form.herbal_notes || null,
      dietary_advice: form.dietary_advice || null,
      exercise_recommendations: form.exercise_recommendations || null,
      lifestyle_notes: form.lifestyle_notes || null,
      follow_up_plan: form.follow_up_plan || null,
      patient_response: form.patient_response || null,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from('treatment_records').update(record).eq('id', editingId));
    } else {
      ({ error } = await supabase.from('treatment_records').insert(record));
    }

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(editingId ? 'Treatment updated' : 'Treatment saved');
      setShowForm(false);
      resetForm();
      loadTreatments();
    }
  }

  function getPatientName(id: string) {
    const p = patients.find(pt => pt.id === id);
    return p ? `${p.first_name} ${p.last_name}` : 'Unknown';
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Treatment Records</h1>
          <p className="text-sm text-gray-400">Log and manage treatment sessions</p>
        </div>
        <button
          onClick={() => { if (showForm) { setShowForm(false); resetForm(); } else { setShowForm(true); } }}
          className="btn-primary"
        >
          {showForm ? 'Cancel' : '+ New Treatment'}
        </button>
      </div>

      {/* Patient Selector */}
      <div className="card mb-6">
        <label className="input-label">Select Patient</label>
        <select
          className="input-field max-w-md"
          value={selectedPatientId}
          onChange={e => {
            setSelectedPatientId(e.target.value);
            setForm({ ...form, patient_id: e.target.value });
          }}
        >
          <option value="">Choose a patient...</option>
          {patients.map(p => (
            <option key={p.id} value={p.id}>{p.last_name}, {p.first_name}</option>
          ))}
        </select>
      </div>

      {/* Treatment Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">
            {editingId ? 'Edit Treatment' : 'New Treatment Record'}
          </h2>

          {/* Basic Info */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="input-label">Patient *</label>
              <select
                className="input-field"
                required
                value={form.patient_id || selectedPatientId}
                onChange={e => setForm({ ...form, patient_id: e.target.value })}
              >
                <option value="">Select patient...</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.last_name}, {p.first_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Treatment Date *</label>
              <input
                type="datetime-local"
                className="input-field"
                required
                value={form.treatment_date}
                onChange={e => setForm({ ...form, treatment_date: e.target.value })}
              />
            </div>
            <div>
              <label className="input-label">Overall Retention Time (min)</label>
              <input
                type="number"
                className="input-field"
                min={0}
                value={form.retention_time}
                onChange={e => setForm({ ...form, retention_time: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Acupuncture Points */}
          <div>
            <label className="input-label">Acupuncture Points</label>
            <div className="relative mb-3">
              <input
                className="input-field"
                placeholder="Search acupuncture points (e.g., LI-4, Zu San Li, ST-36)..."
                value={pointSearch}
                onChange={e => { setPointSearch(e.target.value); setPointDropdownOpen(true); }}
                onFocus={() => setPointDropdownOpen(true)}
              />
              {pointDropdownOpen && filteredPoints.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-dark-300 border border-dark-50 rounded-lg max-h-48 overflow-y-auto shadow-lg">
                  {filteredPoints.map(p => (
                    <button
                      type="button"
                      key={p}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-dark-200 transition-colors ${
                        selectedPoints.find(sp => sp.point === p) ? 'text-earth-300' : 'text-gray-300'
                      }`}
                      onClick={() => addPoint(p)}
                    >
                      {p}
                      {selectedPoints.find(sp => sp.point === p) && (
                        <span className="ml-2 text-xs text-earth-300/70">(added)</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Points List */}
            {selectedPoints.length > 0 && (
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 px-1">
                  <div className="col-span-3">Point</div>
                  <div className="col-span-3">Technique</div>
                  <div className="col-span-2">Retention (min)</div>
                  <div className="col-span-3">Sensation</div>
                  <div className="col-span-1"></div>
                </div>
                {selectedPoints.map(sp => (
                  <div key={sp.point} className="grid grid-cols-12 gap-2 items-center bg-dark-300/50 rounded-lg p-2">
                    <div className="col-span-3 text-sm text-white font-medium truncate" title={sp.point}>
                      {sp.point}
                    </div>
                    <div className="col-span-3">
                      <select
                        className="input-field text-xs py-1.5"
                        value={sp.technique || 'Even'}
                        onChange={e => updatePoint(sp.point, 'technique', e.target.value)}
                      >
                        {TECHNIQUES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        className="input-field text-xs py-1.5"
                        min={0}
                        value={sp.retention_time || ''}
                        onChange={e => updatePoint(sp.point, 'retention_time', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-3">
                      <select
                        className="input-field text-xs py-1.5"
                        value={sp.sensation || 'De Qi achieved'}
                        onChange={e => updatePoint(sp.point, 'sensation', e.target.value)}
                      >
                        {SENSATIONS.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button
                        type="button"
                        className="text-red-400 hover:text-red-300 text-sm"
                        onClick={() => removePoint(sp.point)}
                        title="Remove point"
                      >
                        x
                      </button>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-gray-500 mt-1">
                  {selectedPoints.length} point{selectedPoints.length !== 1 ? 's' : ''} selected
                </p>
              </div>
            )}
          </div>

          {/* Needle Technique */}
          <div>
            <label className="input-label">Needle Technique (Overall)</label>
            <input
              className="input-field"
              placeholder="e.g., Balanced method, gentle insertion, guide tubes used..."
              value={form.needle_technique}
              onChange={e => setForm({ ...form, needle_technique: e.target.value })}
            />
          </div>

          {/* Additional Modalities */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Additional Modalities</h3>
            <div className="space-y-3">
              {/* Moxa */}
              <div className="bg-dark-300/30 rounded-lg p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modalities.moxa}
                    onChange={e => setModalities({ ...modalities, moxa: e.target.checked })}
                    className="w-4 h-4 rounded border-dark-50 bg-dark-300 text-earth-300 focus:ring-earth-300/50"
                  />
                  <span className="text-sm font-medium text-white">Moxibustion</span>
                </label>
                {modalities.moxa && (
                  <textarea
                    className="input-field mt-3"
                    rows={2}
                    placeholder="Type (direct, indirect, stick, cone), areas treated, duration..."
                    value={form.moxa_details}
                    onChange={e => setForm({ ...form, moxa_details: e.target.value })}
                  />
                )}
              </div>

              {/* Cupping */}
              <div className="bg-dark-300/30 rounded-lg p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modalities.cupping}
                    onChange={e => setModalities({ ...modalities, cupping: e.target.checked })}
                    className="w-4 h-4 rounded border-dark-50 bg-dark-300 text-earth-300 focus:ring-earth-300/50"
                  />
                  <span className="text-sm font-medium text-white">Cupping</span>
                </label>
                {modalities.cupping && (
                  <textarea
                    className="input-field mt-3"
                    rows={2}
                    placeholder="Type (stationary, sliding, flash, wet), areas treated, duration..."
                    value={form.cupping_details}
                    onChange={e => setForm({ ...form, cupping_details: e.target.value })}
                  />
                )}
              </div>

              {/* Tuina */}
              <div className="bg-dark-300/30 rounded-lg p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modalities.tuina}
                    onChange={e => setModalities({ ...modalities, tuina: e.target.checked })}
                    className="w-4 h-4 rounded border-dark-50 bg-dark-300 text-earth-300 focus:ring-earth-300/50"
                  />
                  <span className="text-sm font-medium text-white">Tuina Massage</span>
                </label>
                {modalities.tuina && (
                  <textarea
                    className="input-field mt-3"
                    rows={2}
                    placeholder="Techniques used (an fa, tui fa, gun fa), areas treated..."
                    value={form.tuina_details}
                    onChange={e => setForm({ ...form, tuina_details: e.target.value })}
                  />
                )}
              </div>

              {/* Electroacupuncture */}
              <div className="bg-dark-300/30 rounded-lg p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modalities.electroacupuncture}
                    onChange={e => setModalities({ ...modalities, electroacupuncture: e.target.checked })}
                    className="w-4 h-4 rounded border-dark-50 bg-dark-300 text-earth-300 focus:ring-earth-300/50"
                  />
                  <span className="text-sm font-medium text-white">Electroacupuncture</span>
                </label>
                {modalities.electroacupuncture && (
                  <textarea
                    className="input-field mt-3"
                    rows={2}
                    placeholder="Frequency (Hz), point pairs connected, intensity level..."
                    value={form.electroacupuncture_details}
                    onChange={e => setForm({ ...form, electroacupuncture_details: e.target.value })}
                  />
                )}
              </div>

              {/* Gua Sha */}
              <div className="bg-dark-300/30 rounded-lg p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modalities.gua_sha}
                    onChange={e => setModalities({ ...modalities, gua_sha: e.target.checked })}
                    className="w-4 h-4 rounded border-dark-50 bg-dark-300 text-earth-300 focus:ring-earth-300/50"
                  />
                  <span className="text-sm font-medium text-white">Gua Sha</span>
                </label>
                {modalities.gua_sha && (
                  <textarea
                    className="input-field mt-3"
                    rows={2}
                    placeholder="Areas treated, oil used, sha appearance (petechiae, red, purple)..."
                    value={form.gua_sha_details}
                    onChange={e => setForm({ ...form, gua_sha_details: e.target.value })}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Herbal Formula Link */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Herbal Formula</label>
              <select
                className="input-field"
                value={form.herbal_formula_id}
                onChange={e => setForm({ ...form, herbal_formula_id: e.target.value })}
              >
                <option value="">None — no formula linked</option>
                {formulas.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name}{f.chinese_name ? ` (${f.chinese_name})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Herbal Notes</label>
              <textarea
                className="input-field"
                rows={2}
                placeholder="Additional herbal notes, modifications..."
                value={form.herbal_notes}
                onChange={e => setForm({ ...form, herbal_notes: e.target.value })}
              />
            </div>
          </div>

          {/* Advice & Recommendations */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Advice & Recommendations</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Dietary Advice</label>
                <textarea
                  className="input-field"
                  rows={2}
                  placeholder="Dietary recommendations for the patient..."
                  value={form.dietary_advice}
                  onChange={e => setForm({ ...form, dietary_advice: e.target.value })}
                />
              </div>
              <div>
                <label className="input-label">Exercise Recommendations</label>
                <textarea
                  className="input-field"
                  rows={2}
                  placeholder="Qi Gong, Tai Chi, stretching, etc..."
                  value={form.exercise_recommendations}
                  onChange={e => setForm({ ...form, exercise_recommendations: e.target.value })}
                />
              </div>
              <div>
                <label className="input-label">Lifestyle Notes</label>
                <textarea
                  className="input-field"
                  rows={2}
                  placeholder="Sleep, stress management, environmental factors..."
                  value={form.lifestyle_notes}
                  onChange={e => setForm({ ...form, lifestyle_notes: e.target.value })}
                />
              </div>
              <div>
                <label className="input-label">Patient Response</label>
                <textarea
                  className="input-field"
                  rows={2}
                  placeholder="How the patient responded during/after treatment..."
                  value={form.patient_response}
                  onChange={e => setForm({ ...form, patient_response: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Follow-up Plan */}
          <div>
            <label className="input-label">Follow-up Plan</label>
            <textarea
              className="input-field"
              rows={2}
              placeholder="Next appointment, ongoing treatment plan, goals..."
              value={form.follow_up_plan}
              onChange={e => setForm({ ...form, follow_up_plan: e.target.value })}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-dark-50">
            <button
              type="button"
              onClick={() => { setShowForm(false); resetForm(); }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingId ? 'Update Treatment' : 'Save Treatment'}
            </button>
          </div>
        </form>
      )}

      {/* Past Treatments List */}
      {loading ? (
        <div className="text-gray-400 text-center py-8">Loading...</div>
      ) : !selectedPatientId ? (
        <div className="card text-center py-12">
          <div className="text-gray-500 text-4xl mb-3">&#9737;</div>
          <p className="text-gray-400">Select a patient above to view their treatment history.</p>
        </div>
      ) : treatments.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-gray-500 text-4xl mb-3">&#9737;</div>
          <p className="text-gray-400">
            No treatments recorded for {getPatientName(selectedPatientId)} yet.
          </p>
          <button onClick={() => setShowForm(true)} className="btn-cyan mt-4 text-sm">
            Record First Treatment
          </button>
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">
            Treatment History for {getPatientName(selectedPatientId)}
            <span className="text-sm text-gray-400 font-normal ml-2">
              ({treatments.length} record{treatments.length !== 1 ? 's' : ''})
            </span>
          </h2>
          <div className="space-y-3">
            {treatments.map(t => (
              <div
                key={t.id}
                className="card-hover"
                onClick={() => loadTreatmentIntoForm(t)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-white font-medium">
                      {format(new Date(t.treatment_date), 'EEEE, MMMM d, yyyy — h:mm a')}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {t.acupuncture_points?.length > 0 && (
                        <span className="badge-earth">
                          {t.acupuncture_points.length} point{t.acupuncture_points.length !== 1 ? 's' : ''}
                        </span>
                      )}
                      {t.moxa_applied && <span className="badge-warning">Moxa</span>}
                      {t.cupping_applied && <span className="badge-cyan">Cupping</span>}
                      {t.tuina_applied && <span className="badge-success">Tuina</span>}
                      {t.electroacupuncture && <span className="badge-cyan">E-Stim</span>}
                      {t.gua_sha && <span className="badge-warning">Gua Sha</span>}
                      {t.herbal_formula_id && <span className="badge-earth">Herbal Rx</span>}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {t.retention_time ? `${t.retention_time} min` : ''}
                  </span>
                </div>

                {/* Quick preview of points */}
                {t.acupuncture_points?.length > 0 && (
                  <div className="mt-2 text-xs text-gray-400">
                    Points: {t.acupuncture_points.map(p => p.point).join(', ')}
                  </div>
                )}

                {t.follow_up_plan && (
                  <div className="mt-2 text-xs text-gray-500">
                    <span className="text-gray-400 font-medium">Follow-up:</span> {t.follow_up_plan}
                  </div>
                )}

                <div className="mt-2 text-[10px] text-gray-600">
                  Click to edit
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Click outside to close point dropdown */}
      {pointDropdownOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setPointDropdownOpen(false)}
        />
      )}
    </div>
  );
}
