'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { ClinicalNote, Patient } from '@/lib/types';

export default function ClinicalNotesPage() {
  const { practice, profile } = useAppStore();
  const supabase = createClient();
  const searchParams = useSearchParams();

  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedNote, setSelectedNote] = useState<ClinicalNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterPatient, setFilterPatient] = useState(searchParams.get('patient') || '');

  const [form, setForm] = useState({
    patient_id: searchParams.get('patient') || '',
    visit_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    tongue_notes: '',
    pulse_notes: '',
    pattern_diagnosis: '',
    patient_visible: false,
  });

  useEffect(() => {
    if (searchParams.get('new') === '1') setShowForm(true);
  }, [searchParams]);

  useEffect(() => {
    if (!practice) return;
    loadData();
  }, [practice, filterPatient]);

  async function loadData() {
    let query = supabase.from('clinical_notes')
      .select('*, patient:patients(first_name, last_name)')
      .eq('practice_id', practice!.id)
      .order('visit_date', { ascending: false })
      .limit(50);

    if (filterPatient) {
      query = query.eq('patient_id', filterPatient);
    }

    const [notesRes, patientsRes] = await Promise.all([
      query,
      supabase.from('patients')
        .select('id, first_name, last_name')
        .eq('practice_id', practice!.id)
        .eq('is_active', true)
        .order('last_name'),
    ]);

    setNotes(notesRes.data || []);
    setPatients(patientsRes.data || []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      practice_id: practice!.id,
      practitioner_id: profile!.id,
    };

    const { error } = selectedNote
      ? await supabase.from('clinical_notes').update(payload).eq('id', selectedNote.id)
      : await supabase.from('clinical_notes').insert(payload);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(selectedNote ? 'Note updated' : 'Note created');
      resetForm();
      loadData();
    }
  }

  async function signNote(id: string) {
    const { error } = await supabase.from('clinical_notes').update({
      is_signed: true,
      signed_at: new Date().toISOString(),
    }).eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Note signed');
      loadData();
    }
  }

  function editNote(note: ClinicalNote) {
    setSelectedNote(note);
    setForm({
      patient_id: note.patient_id,
      visit_date: format(new Date(note.visit_date), "yyyy-MM-dd'T'HH:mm"),
      subjective: note.subjective || '',
      objective: note.objective || '',
      assessment: note.assessment || '',
      plan: note.plan || '',
      tongue_notes: note.tongue_notes || '',
      pulse_notes: note.pulse_notes || '',
      pattern_diagnosis: note.pattern_diagnosis || '',
      patient_visible: note.patient_visible,
    });
    setShowForm(true);
  }

  function resetForm() {
    setShowForm(false);
    setSelectedNote(null);
    setForm({
      patient_id: searchParams.get('patient') || '',
      visit_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      subjective: '', objective: '', assessment: '', plan: '',
      tongue_notes: '', pulse_notes: '', pattern_diagnosis: '',
      patient_visible: false,
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Clinical Notes</h1>
          <p className="text-sm text-gray-400">SOAP notes for patient visits</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn-primary">
          {showForm ? 'Cancel' : '+ New SOAP Note'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            {selectedNote ? 'Edit SOAP Note' : 'New SOAP Note'}
          </h2>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="input-label">Patient *</label>
              <select className="input-field" required value={form.patient_id} onChange={e => setForm({...form, patient_id: e.target.value})}>
                <option value="">Select patient...</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.last_name}, {p.first_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Visit Date</label>
              <input type="datetime-local" className="input-field" value={form.visit_date} onChange={e => setForm({...form, visit_date: e.target.value})} />
            </div>
          </div>

          {/* SOAP Fields */}
          <div className="space-y-4">
            <div>
              <label className="input-label">
                <span className="inline-block w-6 h-6 rounded bg-blue-500/20 text-blue-400 text-center mr-2 text-xs leading-6">S</span>
                Subjective — Patient&apos;s complaints, symptoms, history
              </label>
              <textarea className="input-field" rows={3} placeholder="Chief complaint, onset, duration, severity, aggravating/relieving factors, associated symptoms..." value={form.subjective} onChange={e => setForm({...form, subjective: e.target.value})} />
            </div>
            <div>
              <label className="input-label">
                <span className="inline-block w-6 h-6 rounded bg-green-500/20 text-green-400 text-center mr-2 text-xs leading-6">O</span>
                Objective — Examination findings, observations
              </label>
              <textarea className="input-field" rows={3} placeholder="Tongue: body, coating, moisture. Pulse: rate, qualities. Palpation findings, range of motion, tender points..." value={form.objective} onChange={e => setForm({...form, objective: e.target.value})} />
            </div>
            <div>
              <label className="input-label">
                <span className="inline-block w-6 h-6 rounded bg-amber-500/20 text-amber-400 text-center mr-2 text-xs leading-6">A</span>
                Assessment — TCM diagnosis, pattern differentiation
              </label>
              <textarea className="input-field" rows={3} placeholder="TCM pattern diagnosis, eight principles, zang-fu differentiation, biomedical diagnosis if applicable..." value={form.assessment} onChange={e => setForm({...form, assessment: e.target.value})} />
            </div>
            <div>
              <label className="input-label">
                <span className="inline-block w-6 h-6 rounded bg-purple-500/20 text-purple-400 text-center mr-2 text-xs leading-6">P</span>
                Plan — Treatment plan, follow-up
              </label>
              <textarea className="input-field" rows={3} placeholder="Points selected, treatment principles, herbal formula, lifestyle advice, follow-up schedule..." value={form.plan} onChange={e => setForm({...form, plan: e.target.value})} />
            </div>
          </div>

          {/* TCM-specific fields */}
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="input-label">Tongue Notes</label>
              <textarea className="input-field" rows={2} value={form.tongue_notes} onChange={e => setForm({...form, tongue_notes: e.target.value})} placeholder="Body color, shape, coating, moisture..." />
            </div>
            <div>
              <label className="input-label">Pulse Notes</label>
              <textarea className="input-field" rows={2} value={form.pulse_notes} onChange={e => setForm({...form, pulse_notes: e.target.value})} placeholder="Rate, qualities by position..." />
            </div>
            <div>
              <label className="input-label">Pattern Diagnosis</label>
              <textarea className="input-field" rows={2} value={form.pattern_diagnosis} onChange={e => setForm({...form, pattern_diagnosis: e.target.value})} placeholder="Liver Qi Stagnation, Spleen Qi Deficiency..." />
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <label className="flex items-center gap-2 text-sm text-gray-400">
              <input type="checkbox" checked={form.patient_visible} onChange={e => setForm({...form, patient_visible: e.target.checked})} className="rounded bg-dark-300 border-dark-50" />
              Visible to patient in portal
            </label>
            <div className="flex gap-3">
              <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">{selectedNote ? 'Update Note' : 'Save Note'}</button>
            </div>
          </div>
        </form>
      )}

      {/* Filter */}
      <div className="mb-4">
        <select className="input-field max-w-xs" value={filterPatient} onChange={e => setFilterPatient(e.target.value)}>
          <option value="">All patients</option>
          {patients.map(p => (
            <option key={p.id} value={p.id}>{p.last_name}, {p.first_name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-gray-400 text-center py-8">Loading notes...</div>
      ) : notes.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400">No clinical notes yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map(note => (
            <div key={note.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-white font-medium">
                    {(note as any).patient?.first_name} {(note as any).patient?.last_name}
                  </span>
                  <span className="text-gray-500 text-sm ml-3">
                    {format(new Date(note.visit_date), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {note.is_signed ? (
                    <span className="badge-success">Signed {note.signed_at ? format(new Date(note.signed_at), 'MMM d') : ''}</span>
                  ) : (
                    <button onClick={() => signNote(note.id)} className="text-xs text-cyan-400 hover:text-cyan-300">Sign Note</button>
                  )}
                  {note.patient_visible && <span className="badge-cyan">Patient Visible</span>}
                  {!note.is_signed && (
                    <button onClick={() => editNote(note)} className="text-xs text-earth-300 hover:text-earth-200">Edit</button>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-sm">
                {note.subjective && (
                  <div>
                    <span className="text-blue-400 font-medium text-xs">SUBJECTIVE</span>
                    <p className="text-gray-300 mt-1 whitespace-pre-wrap">{note.subjective}</p>
                  </div>
                )}
                {note.objective && (
                  <div>
                    <span className="text-green-400 font-medium text-xs">OBJECTIVE</span>
                    <p className="text-gray-300 mt-1 whitespace-pre-wrap">{note.objective}</p>
                  </div>
                )}
                {note.assessment && (
                  <div>
                    <span className="text-amber-400 font-medium text-xs">ASSESSMENT</span>
                    <p className="text-gray-300 mt-1 whitespace-pre-wrap">{note.assessment}</p>
                  </div>
                )}
                {note.plan && (
                  <div>
                    <span className="text-purple-400 font-medium text-xs">PLAN</span>
                    <p className="text-gray-300 mt-1 whitespace-pre-wrap">{note.plan}</p>
                  </div>
                )}
              </div>

              {(note.tongue_notes || note.pulse_notes || note.pattern_diagnosis) && (
                <div className="mt-3 pt-3 border-t border-dark-50 grid md:grid-cols-3 gap-3 text-xs">
                  {note.tongue_notes && <div><span className="text-gray-500">Tongue:</span> <span className="text-gray-300">{note.tongue_notes}</span></div>}
                  {note.pulse_notes && <div><span className="text-gray-500">Pulse:</span> <span className="text-gray-300">{note.pulse_notes}</span></div>}
                  {note.pattern_diagnosis && <div><span className="text-gray-500">Pattern:</span> <span className="text-earth-300">{note.pattern_diagnosis}</span></div>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
