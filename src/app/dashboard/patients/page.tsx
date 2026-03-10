'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import type { Patient } from '@/lib/types';

export default function PatientsPage() {
  const { practice } = useAppStore();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    date_of_birth: '', gender: '', chief_complaint: '',
    medical_history: '', medications: '', allergies: '',
    emergency_contact_name: '', emergency_contact_phone: '',
    address: '', occupation: '', referral_source: '',
  });

  useEffect(() => {
    if (searchParams.get('new') === '1') setShowForm(true);
  }, [searchParams]);

  useEffect(() => {
    if (!practice) return;
    loadPatients();
  }, [practice]);

  async function loadPatients() {
    const { data } = await supabase
      .from('patients')
      .select('*')
      .eq('practice_id', practice!.id)
      .eq('is_active', true)
      .order('last_name');
    setPatients(data || []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const inviteToken = uuidv4();
    const { error } = await supabase.from('patients').insert({
      ...form,
      practice_id: practice!.id,
      invite_token: inviteToken,
      date_of_birth: form.date_of_birth || null,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Patient added');
      setShowForm(false);
      setForm({ first_name: '', last_name: '', email: '', phone: '', date_of_birth: '', gender: '', chief_complaint: '', medical_history: '', medications: '', allergies: '', emergency_contact_name: '', emergency_contact_phone: '', address: '', occupation: '', referral_source: '' });
      loadPatients();
    }
  }

  const filtered = patients.filter(p =>
    `${p.first_name} ${p.last_name} ${p.email} ${p.phone} ${p.chief_complaint}`
      .toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Patients</h1>
          <p className="text-sm text-gray-400">{patients.length} active patients</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ Add Patient'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">New Patient</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="input-label">First Name *</label>
              <input className="input-field" required value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} />
            </div>
            <div>
              <label className="input-label">Last Name *</label>
              <input className="input-field" required value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} />
            </div>
            <div>
              <label className="input-label">Email</label>
              <input type="email" className="input-field" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div>
              <label className="input-label">Phone</label>
              <input className="input-field" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
            <div>
              <label className="input-label">Date of Birth</label>
              <input type="date" className="input-field" value={form.date_of_birth} onChange={e => setForm({...form, date_of_birth: e.target.value})} />
            </div>
            <div>
              <label className="input-label">Gender</label>
              <select className="input-field" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                <option value="">Select...</option>
                <option>Male</option>
                <option>Female</option>
                <option>Non-binary</option>
                <option>Prefer not to say</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="input-label">Chief Complaint</label>
              <textarea className="input-field" rows={2} value={form.chief_complaint} onChange={e => setForm({...form, chief_complaint: e.target.value})} />
            </div>
            <div className="md:col-span-3">
              <label className="input-label">Medical History</label>
              <textarea className="input-field" rows={2} value={form.medical_history} onChange={e => setForm({...form, medical_history: e.target.value})} />
            </div>
            <div>
              <label className="input-label">Current Medications</label>
              <textarea className="input-field" rows={2} value={form.medications} onChange={e => setForm({...form, medications: e.target.value})} />
            </div>
            <div>
              <label className="input-label">Allergies</label>
              <textarea className="input-field" rows={2} value={form.allergies} onChange={e => setForm({...form, allergies: e.target.value})} />
            </div>
            <div>
              <label className="input-label">Address</label>
              <textarea className="input-field" rows={2} value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
            </div>
            <div>
              <label className="input-label">Emergency Contact Name</label>
              <input className="input-field" value={form.emergency_contact_name} onChange={e => setForm({...form, emergency_contact_name: e.target.value})} />
            </div>
            <div>
              <label className="input-label">Emergency Contact Phone</label>
              <input className="input-field" value={form.emergency_contact_phone} onChange={e => setForm({...form, emergency_contact_phone: e.target.value})} />
            </div>
            <div>
              <label className="input-label">Occupation</label>
              <input className="input-field" value={form.occupation} onChange={e => setForm({...form, occupation: e.target.value})} />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Patient</button>
          </div>
        </form>
      )}

      <div className="mb-4">
        <input
          className="input-field max-w-md"
          placeholder="Search patients by name, email, phone, complaint..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-gray-400 text-center py-8">Loading patients...</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400">
            {search ? 'No patients match your search.' : 'No patients yet. Click "Add Patient" to get started.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-dark-50">
              <tr>
                <th className="table-header">Name</th>
                <th className="table-header">Contact</th>
                <th className="table-header">Chief Complaint</th>
                <th className="table-header">Added</th>
                <th className="table-header">Portal</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-50">
              {filtered.map(patient => (
                <tr key={patient.id} className="hover:bg-dark-300/30">
                  <td className="table-cell">
                    <Link href={`/dashboard/patients/${patient.id}`} className="text-white hover:text-earth-300">
                      {patient.last_name}, {patient.first_name}
                    </Link>
                  </td>
                  <td className="table-cell">
                    <div>{patient.email}</div>
                    <div className="text-xs text-gray-500">{patient.phone}</div>
                  </td>
                  <td className="table-cell max-w-xs truncate">{patient.chief_complaint || '—'}</td>
                  <td className="table-cell text-xs">{format(new Date(patient.created_at), 'MMM d, yyyy')}</td>
                  <td className="table-cell">
                    {patient.user_id ? (
                      <span className="badge-success">Active</span>
                    ) : patient.invite_token ? (
                      <span className="badge-warning">Invited</span>
                    ) : (
                      <span className="badge text-gray-500 bg-dark-200">None</span>
                    )}
                  </td>
                  <td className="table-cell">
                    <Link href={`/dashboard/patients/${patient.id}`} className="text-sm text-cyan-400 hover:text-cyan-300">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
