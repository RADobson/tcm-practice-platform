'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { useSearchParams } from 'next/navigation';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval, isSameDay, addHours, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import type { Appointment, Patient } from '@/lib/types';
import { APPOINTMENT_TYPES } from '@/lib/tcm-data';

interface AppointmentWithPatient extends Appointment {
  patient?: { first_name: string; last_name: string };
}

export default function AppointmentsPage() {
  const { practice, profile } = useAppStore();
  const supabase = createClient();
  const searchParams = useSearchParams();

  const [appointments, setAppointments] = useState<AppointmentWithPatient[]>([]);
  const [patients, setPatients] = useState<Pick<Patient, 'id' | 'first_name' | 'last_name'>[]>([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState<'week' | 'list'>('week');

  const [form, setForm] = useState({
    patient_id: searchParams.get('patient') || '',
    start_time: '',
    end_time: '',
    type: 'Follow-up',
    chief_complaint: '',
    notes: '',
  });

  useEffect(() => {
    if (searchParams.get('new') === '1') setShowForm(true);
  }, [searchParams]);

  useEffect(() => {
    if (!practice) return;
    loadData();
  }, [practice, currentWeek]);

  async function loadData() {
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

    const [apptsRes, patientsRes] = await Promise.all([
      supabase.from('appointments')
        .select('*, patient:patients(first_name, last_name)')
        .eq('practice_id', practice!.id)
        .gte('start_time', weekStart.toISOString())
        .lte('start_time', weekEnd.toISOString())
        .order('start_time'),
      supabase.from('patients')
        .select('id, first_name, last_name')
        .eq('practice_id', practice!.id)
        .eq('is_active', true)
        .order('last_name'),
    ]);

    setAppointments(apptsRes.data || []);
    setPatients(patientsRes.data || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from('appointments').insert({
      ...form,
      practice_id: practice!.id,
      practitioner_id: profile!.id,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Appointment scheduled');
      setShowForm(false);
      setForm({ patient_id: '', start_time: '', end_time: '', type: 'Follow-up', chief_complaint: '', notes: '' });
      loadData();
    }
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
    if (error) toast.error(error.message);
    else loadData();
  }

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8am to 7pm

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Appointments</h1>
          <p className="text-sm text-gray-400">
            {format(weekStart, 'MMM d')} — {format(weekEnd, 'MMM d, yyyy')}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-dark-300 rounded-lg overflow-hidden">
            <button onClick={() => setView('week')} className={`px-3 py-1.5 text-sm ${view === 'week' ? 'bg-earth-300/20 text-earth-300' : 'text-gray-400'}`}>Week</button>
            <button onClick={() => setView('list')} className={`px-3 py-1.5 text-sm ${view === 'list' ? 'bg-earth-300/20 text-earth-300' : 'text-gray-400'}`}>List</button>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? 'Cancel' : '+ New Appointment'}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Schedule Appointment</h2>
          <div className="grid md:grid-cols-3 gap-4">
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
              <label className="input-label">Start Time *</label>
              <input type="datetime-local" className="input-field" required value={form.start_time} onChange={e => {
                const start = e.target.value;
                const end = start ? format(addHours(parseISO(start), 1), "yyyy-MM-dd'T'HH:mm") : '';
                setForm({...form, start_time: start, end_time: end});
              }} />
            </div>
            <div>
              <label className="input-label">End Time *</label>
              <input type="datetime-local" className="input-field" required value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} />
            </div>
            <div>
              <label className="input-label">Type</label>
              <select className="input-field" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                {APPOINTMENT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="input-label">Chief Complaint</label>
              <input className="input-field" value={form.chief_complaint} onChange={e => setForm({...form, chief_complaint: e.target.value})} />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Schedule</button>
          </div>
        </form>
      )}

      {/* Navigation */}
      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))} className="btn-secondary text-sm">← Prev</button>
        <button onClick={() => setCurrentWeek(new Date())} className="btn-secondary text-sm">Today</button>
        <button onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))} className="btn-secondary text-sm">Next →</button>
      </div>

      {view === 'week' ? (
        <div className="card overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Day Headers */}
            <div className="grid grid-cols-8 border-b border-dark-50">
              <div className="p-2 text-xs text-gray-500">Time</div>
              {weekDays.map(day => (
                <div key={day.toISOString()} className={`p-2 text-center text-sm ${
                  isSameDay(day, new Date()) ? 'text-earth-300 font-semibold' : 'text-gray-400'
                }`}>
                  <div>{format(day, 'EEE')}</div>
                  <div className="text-lg text-white">{format(day, 'd')}</div>
                </div>
              ))}
            </div>

            {/* Time Grid */}
            {hours.map(hour => (
              <div key={hour} className="grid grid-cols-8 border-b border-dark-50/50 min-h-[60px]">
                <div className="p-2 text-xs text-gray-500">{hour > 12 ? hour - 12 : hour}{hour >= 12 ? 'pm' : 'am'}</div>
                {weekDays.map(day => {
                  const dayAppts = appointments.filter(a => {
                    const apptDate = new Date(a.start_time);
                    return isSameDay(apptDate, day) && apptDate.getHours() === hour;
                  });
                  return (
                    <div key={day.toISOString()} className="p-1 border-l border-dark-50/50">
                      {dayAppts.map(appt => (
                        <div
                          key={appt.id}
                          className={`text-xs p-1.5 rounded mb-1 cursor-pointer ${
                            appt.status === 'completed' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                            appt.status === 'cancelled' ? 'bg-red-500/10 border border-red-500/20 text-red-400 line-through' :
                            appt.status === 'confirmed' ? 'bg-cyan-400/10 border border-cyan-400/20 text-cyan-400' :
                            'bg-earth-300/10 border border-earth-300/20 text-earth-300'
                          }`}
                        >
                          <div className="font-medium truncate">{appt.patient?.first_name} {appt.patient?.last_name}</div>
                          <div className="opacity-70">{appt.type}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card">
          {appointments.length === 0 ? (
            <p className="text-gray-500 text-sm">No appointments this week.</p>
          ) : (
            <div className="space-y-2">
              {appointments.map(appt => (
                <div key={appt.id} className="flex items-center justify-between py-3 border-b border-dark-50 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[60px]">
                      <div className="text-xs text-gray-500">{format(new Date(appt.start_time), 'EEE')}</div>
                      <div className="text-lg text-white">{format(new Date(appt.start_time), 'd')}</div>
                    </div>
                    <div>
                      <div className="text-sm text-white">{appt.patient?.first_name} {appt.patient?.last_name}</div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(appt.start_time), 'h:mm a')} — {format(new Date(appt.end_time), 'h:mm a')} · {appt.type}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      className="input-field text-xs py-1 px-2 w-auto"
                      value={appt.status}
                      onChange={e => updateStatus(appt.id, e.target.value)}
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="no_show">No Show</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
