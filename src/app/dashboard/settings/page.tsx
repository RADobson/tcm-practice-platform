'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import toast from 'react-hot-toast';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const SPECIALTIES_OPTIONS = [
  'Acupuncture',
  'Chinese Herbal Medicine',
  'Tuina Massage',
  'Cupping',
  'Gua Sha',
  'Moxibustion',
  'Electroacupuncture',
  'Auricular Acupuncture',
  'Cosmetic Acupuncture',
  'Sports Acupuncture',
  'Pediatric TCM',
  'Women\'s Health / Fertility',
  'Pain Management',
  'Mental Health / Stress',
  'Digestive Health',
  'Qi Gong',
  'Dietary Therapy',
];

interface BusinessHoursDay {
  open: string;
  close: string;
  closed: boolean;
}

interface SettingsForm {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  website: string;
  license_number: string;
  specialties: string[];
  default_duration: number;
  invoice_prefix: string;
  business_hours: Record<string, BusinessHoursDay>;
}

export default function SettingsPage() {
  const { practice, setPractice } = useAppStore();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const defaultHours: Record<string, BusinessHoursDay> = {};
  DAYS_OF_WEEK.forEach((day) => {
    const key = day.toLowerCase();
    defaultHours[key] = {
      open: '09:00',
      close: '17:00',
      closed: key === 'sunday',
    };
  });

  const [form, setForm] = useState<SettingsForm>({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
    website: '',
    license_number: '',
    specialties: [],
    default_duration: 60,
    invoice_prefix: 'INV',
    business_hours: defaultHours,
  });

  useEffect(() => {
    if (!practice) return;
    loadSettings();
  }, [practice]);

  function loadSettings() {
    if (!practice) return;

    const existingHours: Record<string, BusinessHoursDay> = {};
    DAYS_OF_WEEK.forEach((day) => {
      const key = day.toLowerCase();
      const saved = practice.business_hours?.[key] as { open?: string; close?: string } | undefined;
      existingHours[key] = {
        open: saved?.open || '09:00',
        close: saved?.close || '17:00',
        closed: !saved || (!saved.open && !saved.close),
      };
    });

    setForm({
      name: practice.name || '',
      address: practice.address || '',
      city: practice.city || '',
      state: practice.state || '',
      zip: practice.zip || '',
      phone: practice.phone || '',
      email: practice.email || '',
      website: practice.website || '',
      license_number: practice.license_number || '',
      specialties: practice.specialties || [],
      default_duration: 60,
      invoice_prefix: 'INV',
      business_hours: existingHours,
    });

    setLoading(false);
  }

  function updateField(field: keyof SettingsForm, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleSpecialty(specialty: string) {
    setForm((prev) => {
      const current = prev.specialties;
      const updated = current.includes(specialty)
        ? current.filter((s) => s !== specialty)
        : [...current, specialty];
      return { ...prev, specialties: updated };
    });
  }

  function updateHours(day: string, field: keyof BusinessHoursDay, value: string | boolean) {
    setForm((prev) => ({
      ...prev,
      business_hours: {
        ...prev.business_hours,
        [day]: {
          ...prev.business_hours[day],
          [field]: value,
        },
      },
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!practice) return;

    setSaving(true);
    try {
      // Convert business hours for storage
      const storedHours: Record<string, { open: string; close: string }> = {};
      Object.entries(form.business_hours).forEach(([day, hours]) => {
        if (!hours.closed) {
          storedHours[day] = { open: hours.open, close: hours.close };
        }
      });

      const { data, error } = await supabase
        .from('practices')
        .update({
          name: form.name,
          address: form.address,
          city: form.city,
          state: form.state,
          zip: form.zip,
          phone: form.phone,
          email: form.email,
          website: form.website,
          license_number: form.license_number,
          specialties: form.specialties,
          business_hours: storedHours,
          updated_at: new Date().toISOString(),
        })
        .eq('id', practice.id)
        .select()
        .single();

      if (error) {
        toast.error(error.message);
      } else {
        setPractice(data);
        toast.success('Settings saved successfully');
      }
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-400">Loading settings...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Practice Settings</h1>
        <p className="text-sm text-gray-400">Manage your practice information and preferences</p>
      </div>

      <form onSubmit={handleSave} className="max-w-3xl space-y-6">
        {/* Practice Information */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Practice Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="input-label">Practice Name *</label>
              <input
                className="input-field"
                required
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="input-label">Address</label>
              <input
                className="input-field"
                value={form.address}
                onChange={(e) => updateField('address', e.target.value)}
              />
            </div>
            <div>
              <label className="input-label">City</label>
              <input
                className="input-field"
                value={form.city}
                onChange={(e) => updateField('city', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">State</label>
                <input
                  className="input-field"
                  value={form.state}
                  onChange={(e) => updateField('state', e.target.value)}
                />
              </div>
              <div>
                <label className="input-label">ZIP</label>
                <input
                  className="input-field"
                  value={form.zip}
                  onChange={(e) => updateField('zip', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="input-label">Phone</label>
              <input
                className="input-field"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
              />
            </div>
            <div>
              <label className="input-label">Email</label>
              <input
                type="email"
                className="input-field"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
              />
            </div>
            <div>
              <label className="input-label">Website</label>
              <input
                className="input-field"
                placeholder="https://"
                value={form.website}
                onChange={(e) => updateField('website', e.target.value)}
              />
            </div>
            <div>
              <label className="input-label">License Number</label>
              <input
                className="input-field"
                value={form.license_number}
                onChange={(e) => updateField('license_number', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Business Hours</h2>
          <div className="space-y-3">
            {DAYS_OF_WEEK.map((day) => {
              const key = day.toLowerCase();
              const hours = form.business_hours[key];
              return (
                <div
                  key={day}
                  className="flex items-center gap-4 py-2 border-b border-dark-50 last:border-0"
                >
                  <div className="w-28 text-sm text-gray-300">{day}</div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!hours.closed}
                      onChange={(e) => updateHours(key, 'closed', !e.target.checked)}
                      className="accent-earth-300"
                    />
                    <span className="text-xs text-gray-400">
                      {hours.closed ? 'Closed' : 'Open'}
                    </span>
                  </label>
                  {!hours.closed && (
                    <>
                      <input
                        type="time"
                        className="input-field w-32 text-sm"
                        value={hours.open}
                        onChange={(e) => updateHours(key, 'open', e.target.value)}
                      />
                      <span className="text-gray-500 text-sm">to</span>
                      <input
                        type="time"
                        className="input-field w-32 text-sm"
                        value={hours.close}
                        onChange={(e) => updateHours(key, 'close', e.target.value)}
                      />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Specialties */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Specialties</h2>
          <div className="flex flex-wrap gap-2">
            {SPECIALTIES_OPTIONS.map((specialty) => {
              const isSelected = form.specialties.includes(specialty);
              return (
                <button
                  key={specialty}
                  type="button"
                  onClick={() => toggleSpecialty(specialty)}
                  className={
                    isSelected
                      ? 'px-3 py-1.5 rounded-full text-sm font-medium bg-earth-300/20 text-earth-300 border border-earth-300/40'
                      : 'px-3 py-1.5 rounded-full text-sm font-medium bg-dark-200 text-gray-400 border border-dark-50 hover:border-gray-500'
                  }
                >
                  {specialty}
                </button>
              );
            })}
          </div>
          {form.specialties.length > 0 && (
            <p className="text-xs text-gray-500 mt-3">
              {form.specialties.length} specialt{form.specialties.length === 1 ? 'y' : 'ies'} selected
            </p>
          )}
        </div>

        {/* Preferences */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Preferences</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Default Appointment Duration (minutes)</label>
              <select
                className="input-field"
                value={form.default_duration}
                onChange={(e) => updateField('default_duration', parseInt(e.target.value))}
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={75}>75 minutes</option>
                <option value={90}>90 minutes</option>
                <option value={120}>120 minutes</option>
              </select>
            </div>
            <div>
              <label className="input-label">Invoice Number Prefix</label>
              <input
                className="input-field"
                value={form.invoice_prefix}
                onChange={(e) => updateField('invoice_prefix', e.target.value)}
                placeholder="INV"
              />
              <p className="text-xs text-gray-500 mt-1">
                Invoices will be numbered as: {form.invoice_prefix}-001, {form.invoice_prefix}-002, etc.
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3 pb-8">
          <button
            type="button"
            onClick={loadSettings}
            className="btn-secondary"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            {saving ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-dark-700/30 border-t-dark-700 rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
