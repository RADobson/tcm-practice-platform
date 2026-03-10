'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { Patient, Appointment, ClinicalNote, TongueAnalysis, TreatmentRecord } from '@/lib/types';

export default function PatientDetailPage() {
  const { practice } = useAppStore();
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  const supabase = createClient();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [tongueAnalyses, setTongueAnalyses] = useState<TongueAnalysis[]>([]);
  const [treatments, setTreatments] = useState<TreatmentRecord[]>([]);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Patient>>({});
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!practice) return;
    loadPatient();
  }, [practice, patientId]);

  async function loadPatient() {
    const [patientRes, apptsRes, notesRes, tongueRes, treatRes] = await Promise.all([
      supabase.from('patients').select('*').eq('id', patientId).single(),
      supabase.from('appointments').select('*').eq('patient_id', patientId).order('start_time', { ascending: false }).limit(10),
      supabase.from('clinical_notes').select('*').eq('patient_id', patientId).order('visit_date', { ascending: false }).limit(10),
      supabase.from('tongue_analyses').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }).limit(5),
      supabase.from('treatment_records').select('*').eq('patient_id', patientId).order('treatment_date', { ascending: false }).limit(10),
    ]);

    if (patientRes.data) {
      setPatient(patientRes.data);
      setEditForm(patientRes.data);
    }
    setAppointments(apptsRes.data || []);
    setNotes(notesRes.data || []);
    setTongueAnalyses(tongueRes.data || []);
    setTreatments(treatRes.data || []);
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from('patients').update(editForm).eq('id', patientId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Patient updated');
      setEditing(false);
      loadPatient();
    }
  }

  async function sendInvite() {
    if (!patient?.invite_token || !patient?.email) {
      toast.error('Patient needs an email address and invite token');
      return;
    }
    const inviteUrl = `${window.location.origin}/auth/invite/${patient.invite_token}`;
    await navigator.clipboard.writeText(inviteUrl);
    toast.success('Invite link copied to clipboard! Share it with your patient.');
  }

  if (!patient) {
    return <div className="text-gray-400 text-center py-8">Loading patient...</div>;
  }

  const tabs = ['overview', 'appointments', 'notes', 'diagnostics', 'treatments'];

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <Link href="/dashboard/patients" className="hover:text-white">Patients</Link>
        <span>/</span>
        <span className="text-white">{patient.first_name} {patient.last_name}</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{patient.first_name} {patient.last_name}</h1>
          <p className="text-sm text-gray-400">{patient.chief_complaint || 'No chief complaint'}</p>
        </div>
        <div className="flex gap-2">
          {patient.invite_token && !patient.user_id && (
            <button onClick={sendInvite} className="btn-cyan text-sm">Copy Portal Invite</button>
          )}
          <button onClick={() => setEditing(!editing)} className="btn-secondary text-sm">
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-dark-50 pb-px">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm capitalize rounded-t-lg transition-colors ${
              activeTab === tab
                ? 'text-earth-300 bg-earth-300/10 border-b-2 border-earth-300'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        editing ? (
          <form onSubmit={handleUpdate} className="card">
            <div className="grid md:grid-cols-3 gap-4">
              {Object.entries({
                first_name: 'First Name', last_name: 'Last Name', email: 'Email',
                phone: 'Phone', gender: 'Gender', occupation: 'Occupation',
                address: 'Address', emergency_contact_name: 'Emergency Contact',
                emergency_contact_phone: 'Emergency Phone',
              }).map(([key, label]) => (
                <div key={key}>
                  <label className="input-label">{label}</label>
                  <input className="input-field" value={(editForm as any)[key] || ''} onChange={e => setEditForm({...editForm, [key]: e.target.value})} />
                </div>
              ))}
              <div className="md:col-span-3">
                <label className="input-label">Chief Complaint</label>
                <textarea className="input-field" rows={2} value={editForm.chief_complaint || ''} onChange={e => setEditForm({...editForm, chief_complaint: e.target.value})} />
              </div>
              <div className="md:col-span-3">
                <label className="input-label">Medical History</label>
                <textarea className="input-field" rows={3} value={editForm.medical_history || ''} onChange={e => setEditForm({...editForm, medical_history: e.target.value})} />
              </div>
              <div>
                <label className="input-label">Medications</label>
                <textarea className="input-field" rows={2} value={editForm.medications || ''} onChange={e => setEditForm({...editForm, medications: e.target.value})} />
              </div>
              <div>
                <label className="input-label">Allergies</label>
                <textarea className="input-field" rows={2} value={editForm.allergies || ''} onChange={e => setEditForm({...editForm, allergies: e.target.value})} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Save Changes</button>
            </div>
          </form>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Contact</h3>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-500">Email:</span> <span className="text-white ml-2">{patient.email || '—'}</span></div>
                <div><span className="text-gray-500">Phone:</span> <span className="text-white ml-2">{patient.phone || '—'}</span></div>
                <div><span className="text-gray-500">Address:</span> <span className="text-white ml-2">{patient.address || '—'}</span></div>
                <div><span className="text-gray-500">DOB:</span> <span className="text-white ml-2">{patient.date_of_birth ? format(new Date(patient.date_of_birth), 'MMM d, yyyy') : '—'}</span></div>
                <div><span className="text-gray-500">Gender:</span> <span className="text-white ml-2">{patient.gender || '—'}</span></div>
                <div><span className="text-gray-500">Occupation:</span> <span className="text-white ml-2">{patient.occupation || '—'}</span></div>
              </div>
            </div>
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Medical</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500 block mb-1">Chief Complaint</span>
                  <span className="text-white">{patient.chief_complaint || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Medical History</span>
                  <span className="text-white whitespace-pre-wrap">{patient.medical_history || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Medications</span>
                  <span className="text-white">{patient.medications || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Allergies</span>
                  <span className="text-white">{patient.allergies || '—'}</span>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {activeTab === 'appointments' && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-white">Appointment History</h3>
            <Link href={`/dashboard/appointments?patient=${patientId}`} className="btn-primary text-sm">
              + New Appointment
            </Link>
          </div>
          {appointments.length === 0 ? (
            <p className="text-gray-500 text-sm">No appointments recorded.</p>
          ) : (
            <div className="space-y-2">
              {appointments.map(appt => (
                <div key={appt.id} className="flex items-center justify-between py-2 border-b border-dark-50">
                  <div>
                    <div className="text-sm text-white">{format(new Date(appt.start_time), 'MMM d, yyyy h:mm a')}</div>
                    <div className="text-xs text-gray-500">{appt.type}</div>
                  </div>
                  <span className={`badge ${
                    appt.status === 'completed' ? 'badge-success' :
                    appt.status === 'cancelled' ? 'badge-danger' : 'badge-earth'
                  }`}>{appt.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-white">Clinical Notes</h3>
            <Link href={`/dashboard/notes?patient=${patientId}`} className="btn-primary text-sm">
              + New Note
            </Link>
          </div>
          {notes.length === 0 ? (
            <p className="text-gray-500 text-sm">No clinical notes recorded.</p>
          ) : (
            <div className="space-y-3">
              {notes.map(note => (
                <div key={note.id} className="border border-dark-50 rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-white">{format(new Date(note.visit_date), 'MMM d, yyyy')}</span>
                    <div className="flex gap-2">
                      {note.is_signed && <span className="badge-success">Signed</span>}
                      {note.patient_visible && <span className="badge-cyan">Patient Visible</span>}
                    </div>
                  </div>
                  {note.subjective && <p className="text-xs text-gray-400 mt-1"><strong>S:</strong> {note.subjective.substring(0, 120)}...</p>}
                  {note.assessment && <p className="text-xs text-gray-400 mt-1"><strong>A:</strong> {note.assessment.substring(0, 120)}...</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'diagnostics' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-semibold text-white mb-3">Tongue Analyses ({tongueAnalyses.length})</h3>
            {tongueAnalyses.length === 0 ? (
              <p className="text-gray-500 text-sm">No tongue analyses recorded.</p>
            ) : (
              <div className="space-y-2">
                {tongueAnalyses.map(t => (
                  <div key={t.id} className="flex items-center justify-between py-2 border-b border-dark-50">
                    <div>
                      <div className="text-sm text-white">{format(new Date(t.created_at), 'MMM d, yyyy')}</div>
                      <div className="text-xs text-gray-500">
                        {t.body_color || '—'} body, {t.coating_color || '—'} coating
                      </div>
                    </div>
                    {t.is_self_assessment && <span className="badge-cyan">Self</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="card">
            <h3 className="font-semibold text-white mb-3">Recent Treatments ({treatments.length})</h3>
            {treatments.length === 0 ? (
              <p className="text-gray-500 text-sm">No treatments recorded.</p>
            ) : (
              <div className="space-y-2">
                {treatments.map(t => (
                  <div key={t.id} className="py-2 border-b border-dark-50">
                    <div className="text-sm text-white">{format(new Date(t.treatment_date), 'MMM d, yyyy')}</div>
                    <div className="text-xs text-gray-500">
                      {t.acupuncture_points?.length || 0} points
                      {t.moxa_applied && ' • Moxa'}
                      {t.cupping_applied && ' • Cupping'}
                      {t.tuina_applied && ' • Tuina'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'treatments' && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-white">Treatment Records</h3>
            <Link href={`/dashboard/treatments?patient=${patientId}`} className="btn-primary text-sm">
              + New Treatment
            </Link>
          </div>
          {treatments.length === 0 ? (
            <p className="text-gray-500 text-sm">No treatment records.</p>
          ) : (
            <div className="space-y-3">
              {treatments.map(t => (
                <div key={t.id} className="border border-dark-50 rounded-lg p-4">
                  <div className="text-sm text-white mb-2">{format(new Date(t.treatment_date), 'MMM d, yyyy')}</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div className="text-gray-400">Points: <span className="text-white">{t.acupuncture_points?.length || 0}</span></div>
                    <div className="text-gray-400">Moxa: <span className="text-white">{t.moxa_applied ? 'Yes' : 'No'}</span></div>
                    <div className="text-gray-400">Cupping: <span className="text-white">{t.cupping_applied ? 'Yes' : 'No'}</span></div>
                    <div className="text-gray-400">Tuina: <span className="text-white">{t.tuina_applied ? 'Yes' : 'No'}</span></div>
                  </div>
                  {t.patient_response && <p className="text-xs text-gray-400 mt-2">Response: {t.patient_response}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
