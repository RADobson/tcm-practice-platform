'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { HerbalFormula, HerbEntry } from '@/lib/types';
import { COMMON_HERBS, HERB_ROLES } from '@/lib/tcm-data';

type PatientOption = { id: string; first_name: string; last_name: string };

const FORMULA_CATEGORIES = [
  'Tonify Qi', 'Tonify Blood', 'Tonify Yin', 'Tonify Yang',
  'Clear Heat', 'Clear Heat Resolve Toxin', 'Clear Heat Dry Dampness',
  'Drain Dampness', 'Warm Interior', 'Release Exterior',
  'Regulate Qi', 'Invigorate Blood', 'Stop Bleeding',
  'Calm Spirit', 'Open Orifices', 'Extinguish Wind',
  'Resolve Phlegm', 'Relieve Food Stagnation', 'Stabilize and Bind',
  'Harmonize', 'Other',
];

const PREPARATION_METHODS = ['Decoction', 'Powder', 'Pills', 'Tincture', 'Granules'];

const emptyFormula = {
  name: '',
  chinese_name: '',
  source_text: '',
  category: '',
  actions: '',
  indications: '',
  contraindications: '',
  preparation_method: 'Decoction',
  dosage_instructions: '',
  is_template: false,
  patient_id: '',
  modifications: '',
};

export default function HerbsPage() {
  const { practice, profile } = useAppStore();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [formulas, setFormulas] = useState<HerbalFormula[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingFormula, setViewingFormula] = useState<HerbalFormula | null>(null);

  // Tabs: templates vs patient formulas
  const [activeTab, setActiveTab] = useState<'templates' | 'patient'>('templates');
  const [listSearch, setListSearch] = useState('');
  const [listCategory, setListCategory] = useState('');

  // Formula form state
  const [form, setForm] = useState({ ...emptyFormula });
  const [herbs, setHerbs] = useState<HerbEntry[]>([]);
  const [herbSearch, setHerbSearch] = useState('');
  const [herbDropdownOpen, setHerbDropdownOpen] = useState(false);

  useEffect(() => {
    if (!practice) return;
    loadData();
  }, [practice]);

  async function loadData() {
    const [formulasRes, patientsRes] = await Promise.all([
      supabase
        .from('herbal_formulas')
        .select('*')
        .eq('practice_id', practice!.id)
        .order('name'),
      supabase
        .from('patients')
        .select('id, first_name, last_name')
        .eq('practice_id', practice!.id)
        .eq('is_active', true)
        .order('last_name'),
    ]);
    setFormulas(formulasRes.data || []);
    setPatients(patientsRes.data || []);
    setLoading(false);
  }

  // Herb search
  const filteredHerbs = useMemo(() => {
    if (!herbSearch.trim()) return COMMON_HERBS.slice(0, 15);
    const q = herbSearch.toLowerCase();
    return COMMON_HERBS.filter(h =>
      h.pin_yin.toLowerCase().includes(q) ||
      h.english.toLowerCase().includes(q) ||
      h.latin.toLowerCase().includes(q)
    );
  }, [herbSearch]);

  // Formula list filtering
  const filteredFormulas = useMemo(() => {
    let list = formulas.filter(f => activeTab === 'templates' ? f.is_template : !f.is_template);
    if (listSearch.trim()) {
      const q = listSearch.toLowerCase();
      list = list.filter(f =>
        f.name.toLowerCase().includes(q) ||
        (f.chinese_name || '').toLowerCase().includes(q) ||
        (f.category || '').toLowerCase().includes(q)
      );
    }
    if (listCategory) {
      list = list.filter(f => f.category === listCategory);
    }
    return list;
  }, [formulas, activeTab, listSearch, listCategory]);

  function addHerb(herb: typeof COMMON_HERBS[0]) {
    if (herbs.find(h => h.pin_yin === herb.pin_yin)) {
      toast.error(`${herb.pin_yin} is already in the formula`);
      return;
    }
    setHerbs([...herbs, {
      pin_yin: herb.pin_yin,
      english: herb.english,
      latin: herb.latin,
      dosage: 9,
      unit: 'g',
      role: 'zuo',
      notes: '',
    }]);
    setHerbSearch('');
    setHerbDropdownOpen(false);
  }

  function removeHerb(pinYin: string) {
    setHerbs(herbs.filter(h => h.pin_yin !== pinYin));
  }

  function updateHerb(pinYin: string, field: keyof HerbEntry, value: string | number) {
    setHerbs(herbs.map(h =>
      h.pin_yin === pinYin ? { ...h, [field]: value } : h
    ));
  }

  function moveHerb(index: number, direction: 'up' | 'down') {
    const newHerbs = [...herbs];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newHerbs.length) return;
    [newHerbs[index], newHerbs[targetIndex]] = [newHerbs[targetIndex], newHerbs[index]];
    setHerbs(newHerbs);
  }

  const totalWeight = useMemo(() => {
    return herbs
      .filter(h => h.unit === 'g')
      .reduce((sum, h) => sum + (h.dosage || 0), 0);
  }, [herbs]);

  function resetForm() {
    setForm({ ...emptyFormula });
    setHerbs([]);
    setEditingId(null);
  }

  function loadFormulaIntoForm(f: HerbalFormula) {
    setForm({
      name: f.name,
      chinese_name: f.chinese_name || '',
      source_text: f.source_text || '',
      category: f.category || '',
      actions: f.actions || '',
      indications: f.indications || '',
      contraindications: f.contraindications || '',
      preparation_method: f.preparation_method || 'Decoction',
      dosage_instructions: f.dosage_instructions || '',
      is_template: f.is_template,
      patient_id: f.patient_id || '',
      modifications: f.modifications || '',
    });
    setHerbs(f.herbs || []);
    setEditingId(f.id);
    setViewingFormula(null);
    setShowForm(true);
  }

  function cloneFormula(f: HerbalFormula) {
    setForm({
      name: `${f.name} (Copy)`,
      chinese_name: f.chinese_name || '',
      source_text: f.source_text || '',
      category: f.category || '',
      actions: f.actions || '',
      indications: f.indications || '',
      contraindications: f.contraindications || '',
      preparation_method: f.preparation_method || 'Decoction',
      dosage_instructions: f.dosage_instructions || '',
      is_template: false,
      patient_id: '',
      modifications: '',
    });
    setHerbs(f.herbs || []);
    setEditingId(null);
    setViewingFormula(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Formula name is required');
      return;
    }

    const record = {
      practice_id: practice!.id,
      practitioner_id: profile!.id,
      name: form.name,
      chinese_name: form.chinese_name || null,
      source_text: form.source_text || null,
      category: form.category || null,
      actions: form.actions || null,
      indications: form.indications || null,
      contraindications: form.contraindications || null,
      herbs,
      preparation_method: form.preparation_method || null,
      dosage_instructions: form.dosage_instructions || null,
      is_template: form.is_template,
      patient_id: form.is_template ? null : (form.patient_id || null),
      modifications: form.modifications || null,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from('herbal_formulas').update(record).eq('id', editingId));
    } else {
      ({ error } = await supabase.from('herbal_formulas').insert(record));
    }

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(editingId ? 'Formula updated' : 'Formula saved');
      setShowForm(false);
      resetForm();
      loadData();
    }
  }

  function getRoleBadgeClass(key: string) {
    switch (key) {
      case 'jun': return 'badge-danger';
      case 'chen': return 'badge-warning';
      case 'zuo': return 'badge-cyan';
      case 'shi': return 'badge-success';
      default: return 'badge-earth';
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
          <h1 className="text-2xl font-bold text-white">Herbal Formulas</h1>
          <p className="text-sm text-gray-400">Build and manage herbal prescriptions</p>
        </div>
        <button
          onClick={() => {
            if (showForm) { setShowForm(false); resetForm(); }
            else { setShowForm(true); setViewingFormula(null); }
          }}
          className="btn-primary"
        >
          {showForm ? 'Cancel' : '+ New Formula'}
        </button>
      </div>

      {/* Detail View Modal */}
      {viewingFormula && !showForm && (
        <div className="card mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">{viewingFormula.name}</h2>
              {viewingFormula.chinese_name && (
                <p className="text-earth-300 text-sm">{viewingFormula.chinese_name}</p>
              )}
              <div className="flex gap-2 mt-2">
                {viewingFormula.category && <span className="badge-earth">{viewingFormula.category}</span>}
                {viewingFormula.is_template && <span className="badge-cyan">Template</span>}
                {viewingFormula.preparation_method && (
                  <span className="badge-success">{viewingFormula.preparation_method}</span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => loadFormulaIntoForm(viewingFormula)} className="btn-secondary text-sm">
                Edit
              </button>
              <button onClick={() => cloneFormula(viewingFormula)} className="btn-cyan text-sm">
                Clone
              </button>
              <button onClick={() => setViewingFormula(null)} className="btn-secondary text-sm">
                Close
              </button>
            </div>
          </div>

          {viewingFormula.source_text && (
            <div className="mb-4">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Source</span>
              <p className="text-sm text-gray-300 mt-1">{viewingFormula.source_text}</p>
            </div>
          )}

          {viewingFormula.patient_id && (
            <div className="mb-4">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Patient</span>
              <p className="text-sm text-gray-300 mt-1">{getPatientName(viewingFormula.patient_id)}</p>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-4 mb-4">
            {viewingFormula.actions && (
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wider">Actions</span>
                <p className="text-sm text-gray-300 mt-1">{viewingFormula.actions}</p>
              </div>
            )}
            {viewingFormula.indications && (
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wider">Indications</span>
                <p className="text-sm text-gray-300 mt-1">{viewingFormula.indications}</p>
              </div>
            )}
            {viewingFormula.contraindications && (
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wider">Contraindications</span>
                <p className="text-sm text-gray-300 mt-1 text-red-400">{viewingFormula.contraindications}</p>
              </div>
            )}
          </div>

          {/* Herb composition */}
          {viewingFormula.herbs?.length > 0 && (
            <div className="mb-4">
              <span className="text-xs text-gray-500 uppercase tracking-wider">
                Composition ({viewingFormula.herbs.length} herbs, {viewingFormula.herbs.filter(h => h.unit === 'g').reduce((s, h) => s + h.dosage, 0)}g total)
              </span>
              <div className="mt-2 space-y-1.5">
                {viewingFormula.herbs.map((h, i) => (
                  <div key={i} className="flex items-center gap-3 bg-dark-300/50 rounded-lg px-3 py-2">
                    <span className={getRoleBadgeClass(h.role)}>
                      {h.role.toUpperCase()}
                    </span>
                    <span className="text-white text-sm font-medium">{h.pin_yin}</span>
                    <span className="text-gray-400 text-xs">({h.english})</span>
                    <span className="ml-auto text-earth-300 text-sm font-medium">
                      {h.dosage}{h.unit}
                    </span>
                    {h.notes && <span className="text-xs text-gray-500 italic">{h.notes}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {viewingFormula.dosage_instructions && (
            <div className="mb-4">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Dosage Instructions</span>
              <p className="text-sm text-gray-300 mt-1">{viewingFormula.dosage_instructions}</p>
            </div>
          )}

          {viewingFormula.modifications && (
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Modifications</span>
              <p className="text-sm text-gray-300 mt-1">{viewingFormula.modifications}</p>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-dark-50 text-xs text-gray-600">
            Created {format(new Date(viewingFormula.created_at), 'MMM d, yyyy h:mm a')}
            {viewingFormula.updated_at !== viewingFormula.created_at && (
              <> &middot; Updated {format(new Date(viewingFormula.updated_at), 'MMM d, yyyy h:mm a')}</>
            )}
          </div>
        </div>
      )}

      {/* Formula Builder Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">
            {editingId ? 'Edit Formula' : 'New Herbal Formula'}
          </h2>

          {/* Name & Identity */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="input-label">Formula Name (English) *</label>
              <input
                className="input-field"
                required
                placeholder="e.g., Four Gentlemen Decoction"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="input-label">Chinese Name</label>
              <input
                className="input-field"
                placeholder="e.g., Si Jun Zi Tang"
                value={form.chinese_name}
                onChange={e => setForm({ ...form, chinese_name: e.target.value })}
              />
            </div>
            <div>
              <label className="input-label">Source Text</label>
              <input
                className="input-field"
                placeholder="e.g., Tai Ping Hui Min He Ji Ju Fang"
                value={form.source_text}
                onChange={e => setForm({ ...form, source_text: e.target.value })}
              />
            </div>
          </div>

          {/* Category & Preparation */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="input-label">Category</label>
              <select
                className="input-field"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
              >
                <option value="">Select category...</option>
                {FORMULA_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Preparation Method</label>
              <select
                className="input-field"
                value={form.preparation_method}
                onChange={e => setForm({ ...form, preparation_method: e.target.value })}
              >
                {PREPARATION_METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="flex items-end gap-4">
              <label className="flex items-center gap-3 cursor-pointer pb-2.5">
                <input
                  type="checkbox"
                  checked={form.is_template}
                  onChange={e => setForm({ ...form, is_template: e.target.checked })}
                  className="w-4 h-4 rounded border-dark-50 bg-dark-300 text-earth-300 focus:ring-earth-300/50"
                />
                <span className="text-sm text-white">Save as Template</span>
              </label>
            </div>
          </div>

          {/* Patient (if not template) */}
          {!form.is_template && (
            <div>
              <label className="input-label">Patient</label>
              <select
                className="input-field max-w-md"
                value={form.patient_id}
                onChange={e => setForm({ ...form, patient_id: e.target.value })}
              >
                <option value="">No patient assigned</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.last_name}, {p.first_name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Actions, Indications, Contraindications */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="input-label">Actions</label>
              <textarea
                className="input-field"
                rows={3}
                placeholder="Tonifies Qi, strengthens the Spleen..."
                value={form.actions}
                onChange={e => setForm({ ...form, actions: e.target.value })}
              />
            </div>
            <div>
              <label className="input-label">Indications</label>
              <textarea
                className="input-field"
                rows={3}
                placeholder="Spleen and Stomach Qi deficiency with pallid complexion..."
                value={form.indications}
                onChange={e => setForm({ ...form, indications: e.target.value })}
              />
            </div>
            <div>
              <label className="input-label">Contraindications</label>
              <textarea
                className="input-field"
                rows={3}
                placeholder="Not suitable for excess conditions..."
                value={form.contraindications}
                onChange={e => setForm({ ...form, contraindications: e.target.value })}
              />
            </div>
          </div>

          {/* Herb Builder */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="input-label mb-0">Herb Composition</label>
              {herbs.length > 0 && (
                <span className="text-sm text-earth-300 font-medium">
                  Total: {totalWeight}g ({herbs.length} herb{herbs.length !== 1 ? 's' : ''})
                </span>
              )}
            </div>

            {/* Herb search */}
            <div className="relative mb-3">
              <input
                className="input-field"
                placeholder="Search herbs by Pin Yin, English, or Latin name..."
                value={herbSearch}
                onChange={e => { setHerbSearch(e.target.value); setHerbDropdownOpen(true); }}
                onFocus={() => setHerbDropdownOpen(true)}
              />
              {herbDropdownOpen && filteredHerbs.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-dark-300 border border-dark-50 rounded-lg max-h-56 overflow-y-auto shadow-lg">
                  {filteredHerbs.map(h => (
                    <button
                      type="button"
                      key={h.pin_yin}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-dark-200 transition-colors border-b border-dark-50/50 last:border-0 ${
                        herbs.find(eh => eh.pin_yin === h.pin_yin) ? 'text-earth-300' : 'text-gray-300'
                      }`}
                      onClick={() => addHerb(h)}
                    >
                      <span className="font-medium">{h.pin_yin}</span>
                      <span className="text-gray-500"> &mdash; {h.english}</span>
                      <span className="text-gray-600 text-xs"> ({h.latin})</span>
                      <span className="float-right text-xs text-gray-500">[{h.category}]</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Herb list */}
            {herbs.length > 0 ? (
              <div className="space-y-2">
                <div className="hidden md:grid grid-cols-12 gap-2 text-xs text-gray-500 px-1">
                  <div className="col-span-1"></div>
                  <div className="col-span-3">Herb</div>
                  <div className="col-span-2">Role</div>
                  <div className="col-span-1">Dosage</div>
                  <div className="col-span-1">Unit</div>
                  <div className="col-span-3">Notes</div>
                  <div className="col-span-1"></div>
                </div>
                {herbs.map((h, idx) => (
                  <div key={h.pin_yin} className="grid grid-cols-12 gap-2 items-center bg-dark-300/50 rounded-lg p-2">
                    {/* Reorder */}
                    <div className="col-span-1 flex flex-col items-center gap-0.5">
                      <button
                        type="button"
                        className="text-gray-500 hover:text-white text-xs leading-none disabled:opacity-30"
                        disabled={idx === 0}
                        onClick={() => moveHerb(idx, 'up')}
                        title="Move up"
                      >
                        &#9650;
                      </button>
                      <button
                        type="button"
                        className="text-gray-500 hover:text-white text-xs leading-none disabled:opacity-30"
                        disabled={idx === herbs.length - 1}
                        onClick={() => moveHerb(idx, 'down')}
                        title="Move down"
                      >
                        &#9660;
                      </button>
                    </div>

                    {/* Name */}
                    <div className="col-span-3">
                      <div className="text-sm text-white font-medium">{h.pin_yin}</div>
                      <div className="text-[10px] text-gray-500">{h.english}</div>
                    </div>

                    {/* Role */}
                    <div className="col-span-2">
                      <select
                        className="input-field text-xs py-1.5"
                        value={h.role}
                        onChange={e => updateHerb(h.pin_yin, 'role', e.target.value)}
                      >
                        {HERB_ROLES.map(r => (
                          <option key={r.key} value={r.key}>{r.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Dosage */}
                    <div className="col-span-1">
                      <input
                        type="number"
                        className="input-field text-xs py-1.5"
                        min={0}
                        step={0.5}
                        value={h.dosage}
                        onChange={e => updateHerb(h.pin_yin, 'dosage', parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    {/* Unit */}
                    <div className="col-span-1">
                      <select
                        className="input-field text-xs py-1.5"
                        value={h.unit}
                        onChange={e => updateHerb(h.pin_yin, 'unit', e.target.value)}
                      >
                        <option value="g">g</option>
                        <option value="ml">ml</option>
                        <option value="pieces">pcs</option>
                      </select>
                    </div>

                    {/* Notes */}
                    <div className="col-span-3">
                      <input
                        className="input-field text-xs py-1.5"
                        placeholder="Notes..."
                        value={h.notes || ''}
                        onChange={e => updateHerb(h.pin_yin, 'notes', e.target.value)}
                      />
                    </div>

                    {/* Remove */}
                    <div className="col-span-1 flex justify-center">
                      <button
                        type="button"
                        className="text-red-400 hover:text-red-300 text-sm"
                        onClick={() => removeHerb(h.pin_yin)}
                        title="Remove herb"
                      >
                        x
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm py-3">
                No herbs added yet. Search above to add herbs to this formula.
              </p>
            )}
          </div>

          {/* Dosage Instructions */}
          <div>
            <label className="input-label">Dosage Instructions</label>
            <textarea
              className="input-field"
              rows={2}
              placeholder="e.g., Decoct in 3 cups of water down to 1 cup, take warm twice daily..."
              value={form.dosage_instructions}
              onChange={e => setForm({ ...form, dosage_instructions: e.target.value })}
            />
          </div>

          {/* Modifications */}
          <div>
            <label className="input-label">Modifications Notes</label>
            <textarea
              className="input-field"
              rows={2}
              placeholder="Modifications from the base formula, rationale..."
              value={form.modifications}
              onChange={e => setForm({ ...form, modifications: e.target.value })}
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
              {editingId ? 'Update Formula' : 'Save Formula'}
            </button>
          </div>
        </form>
      )}

      {/* Formula List */}
      {!showForm && !viewingFormula && (
        <>
          {/* Tabs */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex bg-dark-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setActiveTab('templates')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'templates' ? 'bg-earth-300/20 text-earth-300' : 'text-gray-400 hover:text-white'
                }`}
              >
                Templates
              </button>
              <button
                onClick={() => setActiveTab('patient')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'patient' ? 'bg-earth-300/20 text-earth-300' : 'text-gray-400 hover:text-white'
                }`}
              >
                Patient Formulas
              </button>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex gap-3 mb-4">
            <input
              className="input-field max-w-sm"
              placeholder="Search formulas..."
              value={listSearch}
              onChange={e => setListSearch(e.target.value)}
            />
            <select
              className="input-field w-auto"
              value={listCategory}
              onChange={e => setListCategory(e.target.value)}
            >
              <option value="">All categories</option>
              {FORMULA_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="text-gray-400 text-center py-8">Loading formulas...</div>
          ) : filteredFormulas.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-gray-500 text-4xl mb-3">&#10047;</div>
              <p className="text-gray-400">
                {listSearch || listCategory
                  ? 'No formulas match your search.'
                  : activeTab === 'templates'
                    ? 'No formula templates yet. Create your first template to get started.'
                    : 'No patient-specific formulas yet. Clone a template or create a new formula.'
                }
              </p>
              <button onClick={() => setShowForm(true)} className="btn-cyan mt-4 text-sm">
                Create Formula
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFormulas.map(f => (
                <div
                  key={f.id}
                  className="card-hover"
                  onClick={() => setViewingFormula(f)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-white font-medium">{f.name}</h3>
                      {f.chinese_name && (
                        <p className="text-earth-300 text-xs">{f.chinese_name}</p>
                      )}
                    </div>
                    {f.is_template && <span className="badge-cyan text-[10px]">Template</span>}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {f.category && <span className="badge-earth text-[10px]">{f.category}</span>}
                    {f.preparation_method && (
                      <span className="badge-success text-[10px]">{f.preparation_method}</span>
                    )}
                  </div>

                  {f.herbs?.length > 0 && (
                    <p className="text-xs text-gray-500">
                      {f.herbs.length} herb{f.herbs.length !== 1 ? 's' : ''}
                      {' '}&middot;{' '}
                      {f.herbs.filter(h => h.unit === 'g').reduce((s, h) => s + h.dosage, 0)}g total
                    </p>
                  )}

                  {!f.is_template && f.patient_id && (
                    <p className="text-xs text-gray-400 mt-1">
                      Patient: {getPatientName(f.patient_id)}
                    </p>
                  )}

                  <p className="text-[10px] text-gray-600 mt-2">
                    {format(new Date(f.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Click outside to close herb dropdown */}
      {herbDropdownOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setHerbDropdownOpen(false)}
        />
      )}
    </div>
  );
}
