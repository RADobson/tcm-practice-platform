'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface IntakeForm {
  chief_complaint: string;
  medical_history: string;
  current_medications: string;
  allergies: string;
  sleep_quality: string;
  sleep_hours: string;
  digestion: string;
  appetite: string;
  thirst: string;
  urination: string;
  bowel_movements: string;
  menstrual_notes: string;
  emotions: string;
  energy_level: string;
  pain_description: string;
  temperature_preference: string;
  sweating: string;
  additional_notes: string;
}

const INITIAL_FORM: IntakeForm = {
  chief_complaint: '',
  medical_history: '',
  current_medications: '',
  allergies: '',
  sleep_quality: '',
  sleep_hours: '',
  digestion: '',
  appetite: '',
  thirst: '',
  urination: '',
  bowel_movements: '',
  menstrual_notes: '',
  emotions: '',
  energy_level: '',
  pain_description: '',
  temperature_preference: '',
  sweating: '',
  additional_notes: '',
};

const SECTIONS = [
  { key: 'basics', label: 'Basic Information', icon: '📋' },
  { key: 'sleep_energy', label: 'Sleep & Energy', icon: '🌙' },
  { key: 'digestion', label: 'Digestion', icon: '🍵' },
  { key: 'body', label: 'Body & Pain', icon: '🫀' },
  { key: 'emotions', label: 'Emotions', icon: '💭' },
  { key: 'additional', label: 'Additional', icon: '📝' },
];

export default function PatientIntakePage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [form, setForm] = useState<IntakeForm>(INITIAL_FORM);

  // Patient + practice info
  const [patientId, setPatientId] = useState('');
  const [practiceId, setPracticeId] = useState('');
  const [patientName, setPatientName] = useState('');

  useEffect(() => {
    loadPatientInfo();
  }, []);

  async function loadPatientInfo() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: patient } = await supabase
      .from('patients')
      .select('id, practice_id, first_name, last_name')
      .eq('user_id', user.id)
      .single();

    if (patient) {
      setPatientId(patient.id);
      setPracticeId(patient.practice_id);
      setPatientName(`${patient.first_name} ${patient.last_name}`);
    }

    // Check for existing unsubmitted intake
    if (patient) {
      const { data: existing } = await supabase
        .from('patient_intakes')
        .select('*')
        .eq('patient_id', patient.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existing) {
        setForm({
          chief_complaint: existing.chief_complaint || '',
          medical_history: existing.medical_history || '',
          current_medications: existing.current_medications || '',
          allergies: existing.allergies || '',
          sleep_quality: existing.sleep_quality || '',
          sleep_hours: existing.sleep_hours || '',
          digestion: existing.digestion || '',
          appetite: existing.appetite || '',
          thirst: existing.thirst || '',
          urination: existing.urination || '',
          bowel_movements: existing.bowel_movements || '',
          menstrual_notes: existing.menstrual_notes || '',
          emotions: existing.emotions || '',
          energy_level: existing.energy_level || '',
          pain_description: existing.pain_description || '',
          temperature_preference: existing.temperature_preference || '',
          sweating: existing.sweating || '',
          additional_notes: existing.additional_notes || '',
        });
      }
    }

    setLoading(false);
  }

  function updateForm(key: keyof IntakeForm, value: string) {
    setForm({ ...form, [key]: value });
  }

  async function handleSubmit() {
    if (!patientId || !practiceId) {
      toast.error('Patient information not found');
      return;
    }
    if (!form.chief_complaint.trim()) {
      toast.error('Please describe your main concern');
      setCurrentSection(0);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/intake/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit',
          practice_id: practiceId,
          patient_id: patientId,
          ...form,
        }),
      });
      if (!res.ok) throw new Error('Submission failed');
      setSubmitted(true);
      toast.success('Intake form submitted successfully');
    } catch {
      toast.error('Failed to submit intake form');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-700 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-dark-700 p-4">
        <div className="max-w-lg mx-auto pt-16 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Intake Form Submitted</h1>
          <p className="text-gray-400 mb-6">
            Thank you, {patientName}. Your practitioner will review your responses before your appointment.
          </p>
          <a href="/portal" className="btn-primary inline-block">
            Return to Portal
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-700">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-dark-600 border-b border-dark-50 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-white">Health Intake Form</h1>
              <p className="text-xs text-gray-400">{patientName}</p>
            </div>
            <a href="/portal" className="text-sm text-gray-400 hover:text-gray-300">
              Cancel
            </a>
          </div>
          {/* Progress bar */}
          <div className="mt-3 flex gap-1">
            {SECTIONS.map((_, idx) => (
              <div
                key={idx}
                className={`flex-1 h-1 rounded-full transition-colors ${
                  idx <= currentSection ? 'bg-earth-300' : 'bg-dark-100'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Section Nav */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {SECTIONS.map((section, idx) => (
            <button
              key={section.key}
              onClick={() => setCurrentSection(idx)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                idx === currentSection
                  ? 'bg-earth-300/20 text-earth-300 border border-earth-300/30'
                  : 'bg-dark-400 text-gray-400 border border-transparent hover:text-gray-300'
              }`}
            >
              <span>{section.icon}</span>
              <span>{section.label}</span>
            </button>
          ))}
        </div>

        {/* Section Content */}
        <div className="space-y-6">
          {/* Section 0: Basics */}
          {currentSection === 0 && (
            <>
              <div className="portal-card">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  What is your main health concern? *
                </label>
                <textarea
                  className="input-field"
                  rows={4}
                  placeholder="Describe what brings you in for treatment..."
                  value={form.chief_complaint}
                  onChange={(e) => updateForm('chief_complaint', e.target.value)}
                />
              </div>
              <div className="portal-card">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Medical History
                </label>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="Previous diagnoses, surgeries, hospitalisations..."
                  value={form.medical_history}
                  onChange={(e) => updateForm('medical_history', e.target.value)}
                />
              </div>
              <div className="portal-card">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Medications & Supplements
                </label>
                <textarea
                  className="input-field"
                  rows={2}
                  placeholder="Include dosages if known..."
                  value={form.current_medications}
                  onChange={(e) => updateForm('current_medications', e.target.value)}
                />
              </div>
              <div className="portal-card">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Allergies
                </label>
                <input
                  className="input-field"
                  placeholder="Food, medication, environmental allergies..."
                  value={form.allergies}
                  onChange={(e) => updateForm('allergies', e.target.value)}
                />
              </div>
            </>
          )}

          {/* Section 1: Sleep & Energy */}
          {currentSection === 1 && (
            <>
              <div className="portal-card">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  How would you describe your sleep quality?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Excellent', 'Good', 'Fair', 'Poor', 'Difficulty falling asleep', 'Wake during night', 'Early waking', 'Vivid dreams'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => updateForm('sleep_quality', form.sleep_quality === opt ? '' : opt)}
                      className={`text-sm px-3 py-2 rounded-lg text-left transition-colors ${
                        form.sleep_quality === opt
                          ? 'bg-earth-300/20 text-earth-300 border border-earth-300/30'
                          : 'bg-dark-300 text-gray-400 border border-dark-50 hover:text-gray-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div className="portal-card">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Average hours of sleep per night
                </label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="e.g. 6-7 hours"
                  value={form.sleep_hours}
                  onChange={(e) => updateForm('sleep_hours', e.target.value)}
                />
              </div>
              <div className="portal-card">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Energy Level
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['High energy', 'Moderate energy', 'Low energy', 'Fatigue', 'Energy crashes', 'Worse in morning', 'Worse in afternoon', 'Worse in evening'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => updateForm('energy_level', form.energy_level === opt ? '' : opt)}
                      className={`text-sm px-3 py-2 rounded-lg text-left transition-colors ${
                        form.energy_level === opt
                          ? 'bg-earth-300/20 text-earth-300 border border-earth-300/30'
                          : 'bg-dark-300 text-gray-400 border border-dark-50 hover:text-gray-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Section 2: Digestion */}
          {currentSection === 2 && (
            <>
              <div className="portal-card">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Digestion
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Good digestion', 'Bloating', 'Gas', 'Acid reflux', 'Nausea', 'Abdominal pain', 'Food sensitivities', 'IBS diagnosed'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        const current = form.digestion.split(', ').filter(Boolean);
                        const updated = current.includes(opt) ? current.filter((c) => c !== opt) : [...current, opt];
                        updateForm('digestion', updated.join(', '));
                      }}
                      className={`text-sm px-3 py-2 rounded-lg text-left transition-colors ${
                        form.digestion.includes(opt)
                          ? 'bg-earth-300/20 text-earth-300 border border-earth-300/30'
                          : 'bg-dark-300 text-gray-400 border border-dark-50 hover:text-gray-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div className="portal-card">
                <label className="block text-sm font-medium text-gray-300 mb-2">Appetite</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Strong', 'Normal', 'Poor', 'Variable', 'Excessive', 'No appetite'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => updateForm('appetite', form.appetite === opt ? '' : opt)}
                      className={`text-sm px-3 py-2 rounded-lg text-center transition-colors ${
                        form.appetite === opt
                          ? 'bg-earth-300/20 text-earth-300 border border-earth-300/30'
                          : 'bg-dark-300 text-gray-400 border border-dark-50 hover:text-gray-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div className="portal-card">
                <label className="block text-sm font-medium text-gray-300 mb-2">Thirst</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Normal thirst', 'Excessive thirst', 'Little thirst', 'Prefer warm drinks', 'Prefer cold drinks', 'Dry mouth'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => updateForm('thirst', form.thirst === opt ? '' : opt)}
                      className={`text-sm px-3 py-2 rounded-lg text-left transition-colors ${
                        form.thirst === opt
                          ? 'bg-earth-300/20 text-earth-300 border border-earth-300/30'
                          : 'bg-dark-300 text-gray-400 border border-dark-50 hover:text-gray-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div className="portal-card">
                <label className="block text-sm font-medium text-gray-300 mb-2">Bowel Movements</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Regular', 'Constipation', 'Loose stools', 'Diarrhoea', 'Alternating', 'Undigested food', 'Mucus', 'Urgent'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => updateForm('bowel_movements', form.bowel_movements === opt ? '' : opt)}
                      className={`text-sm px-3 py-2 rounded-lg text-left transition-colors ${
                        form.bowel_movements === opt
                          ? 'bg-earth-300/20 text-earth-300 border border-earth-300/30'
                          : 'bg-dark-300 text-gray-400 border border-dark-50 hover:text-gray-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div className="portal-card">
                <label className="block text-sm font-medium text-gray-300 mb-2">Urination</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Normal', 'Frequent', 'Urgent', 'Scanty', 'Dark colour', 'Pale colour', 'Night urination', 'Burning'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => updateForm('urination', form.urination === opt ? '' : opt)}
                      className={`text-sm px-3 py-2 rounded-lg text-left transition-colors ${
                        form.urination === opt
                          ? 'bg-earth-300/20 text-earth-300 border border-earth-300/30'
                          : 'bg-dark-300 text-gray-400 border border-dark-50 hover:text-gray-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Section 3: Body & Pain */}
          {currentSection === 3 && (
            <>
              <div className="portal-card">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Describe any pain or discomfort
                </label>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="Location, type (sharp, dull, aching), when it occurs, what makes it better or worse..."
                  value={form.pain_description}
                  onChange={(e) => updateForm('pain_description', e.target.value)}
                />
              </div>
              <div className="portal-card">
                <label className="block text-sm font-medium text-gray-300 mb-2">Temperature Preference</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Feel cold easily', 'Feel hot easily', 'Normal', 'Alternating hot and cold', 'Cold hands/feet', 'Night sweats', 'Hot flashes'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => updateForm('temperature_preference', form.temperature_preference === opt ? '' : opt)}
                      className={`text-sm px-3 py-2 rounded-lg text-left transition-colors ${
                        form.temperature_preference === opt
                          ? 'bg-earth-300/20 text-earth-300 border border-earth-300/30'
                          : 'bg-dark-300 text-gray-400 border border-dark-50 hover:text-gray-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div className="portal-card">
                <label className="block text-sm font-medium text-gray-300 mb-2">Sweating</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Normal sweating', 'Excessive sweating', 'Little/no sweating', 'Spontaneous sweating', 'Night sweats', 'Sweaty palms/feet'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => updateForm('sweating', form.sweating === opt ? '' : opt)}
                      className={`text-sm px-3 py-2 rounded-lg text-left transition-colors ${
                        form.sweating === opt
                          ? 'bg-earth-300/20 text-earth-300 border border-earth-300/30'
                          : 'bg-dark-300 text-gray-400 border border-dark-50 hover:text-gray-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div className="portal-card">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Menstrual Health (if applicable)
                </label>
                <textarea
                  className="input-field"
                  rows={2}
                  placeholder="Cycle regularity, flow, pain, PMS symptoms, or type N/A..."
                  value={form.menstrual_notes}
                  onChange={(e) => updateForm('menstrual_notes', e.target.value)}
                />
              </div>
            </>
          )}

          {/* Section 4: Emotions */}
          {currentSection === 4 && (
            <>
              <div className="portal-card">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  How would you describe your emotional state?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Generally content', 'Anxious', 'Depressed', 'Irritable', 'Stressed', 'Fearful', 'Overthinking', 'Grief/sadness', 'Mood swings', 'Difficulty concentrating'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        const current = form.emotions.split(', ').filter(Boolean);
                        const updated = current.includes(opt) ? current.filter((c) => c !== opt) : [...current, opt];
                        updateForm('emotions', updated.join(', '));
                      }}
                      className={`text-sm px-3 py-2 rounded-lg text-left transition-colors ${
                        form.emotions.includes(opt)
                          ? 'bg-earth-300/20 text-earth-300 border border-earth-300/30'
                          : 'bg-dark-300 text-gray-400 border border-dark-50 hover:text-gray-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Section 5: Additional */}
          {currentSection === 5 && (
            <>
              <div className="portal-card">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Anything else you would like your practitioner to know?
                </label>
                <textarea
                  className="input-field"
                  rows={4}
                  placeholder="Other symptoms, concerns, goals for treatment, questions..."
                  value={form.additional_notes}
                  onChange={(e) => updateForm('additional_notes', e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pb-24">
          <button
            onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
            disabled={currentSection === 0}
            className="btn-secondary"
          >
            Previous
          </button>

          {currentSection < SECTIONS.length - 1 ? (
            <button
              onClick={() => setCurrentSection(currentSection + 1)}
              className="btn-primary"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary px-8"
            >
              {submitting ? 'Submitting...' : 'Submit Intake Form'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
