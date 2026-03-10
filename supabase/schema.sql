-- ============================================================
-- TCM Practice Management Platform — Supabase Schema
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUM TYPES
-- ============================================================

create type user_role as enum ('practitioner', 'patient');
create type appointment_status as enum ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
create type invoice_status as enum ('draft', 'sent', 'paid', 'overdue', 'cancelled');
create type message_type as enum ('text', 'image', 'system');
create type homework_status as enum ('assigned', 'in_progress', 'completed');

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'practitioner',
  email text not null,
  full_name text not null,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- PRACTICES (clinic/practice details)
-- ============================================================

create table practices (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  address text,
  city text,
  state text,
  zip text,
  phone text,
  email text,
  website text,
  logo_url text,
  license_number text,
  specialties text[] default '{}',
  business_hours jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- PATIENTS
-- ============================================================

create table patients (
  id uuid primary key default uuid_generate_v4(),
  practice_id uuid not null references practices(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null, -- linked portal account
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  date_of_birth date,
  gender text,
  address text,
  emergency_contact_name text,
  emergency_contact_phone text,
  chief_complaint text,
  medical_history text,
  medications text,
  allergies text,
  occupation text,
  referral_source text,
  notes text,
  invite_token text unique,
  invite_sent_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- APPOINTMENTS
-- ============================================================

create table appointments (
  id uuid primary key default uuid_generate_v4(),
  practice_id uuid not null references practices(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  practitioner_id uuid not null references profiles(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status appointment_status not null default 'scheduled',
  type text not null default 'Follow-up',
  chief_complaint text,
  notes text,
  reminder_sent boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- CLINICAL NOTES (SOAP)
-- ============================================================

create table clinical_notes (
  id uuid primary key default uuid_generate_v4(),
  practice_id uuid not null references practices(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  practitioner_id uuid not null references profiles(id) on delete cascade,
  appointment_id uuid references appointments(id) on delete set null,
  visit_date timestamptz not null default now(),
  -- SOAP fields
  subjective text,
  objective text,
  assessment text,
  plan text,
  -- TCM specifics
  tongue_notes text,
  pulse_notes text,
  pattern_diagnosis text,
  -- Visibility
  patient_visible boolean not null default false,
  is_signed boolean not null default false,
  signed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- TONGUE ANALYSES
-- ============================================================

create table tongue_analyses (
  id uuid primary key default uuid_generate_v4(),
  practice_id uuid references practices(id) on delete cascade,
  patient_id uuid references patients(id) on delete cascade,
  submitted_by uuid not null references profiles(id) on delete cascade,
  image_url text not null,
  -- Analysis results
  body_color text,
  body_shape text,
  coating_color text,
  coating_thickness text,
  coating_distribution text,
  moisture text,
  sublingual_veins text,
  movement text,
  spirit text,
  regions jsonb default '{}', -- { tip, sides, center, root }
  ai_analysis text,
  ai_patterns text[] default '{}',
  practitioner_notes text,
  -- Source
  is_self_assessment boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- TRIGGER POINT MAPS
-- ============================================================

create table trigger_point_maps (
  id uuid primary key default uuid_generate_v4(),
  practice_id uuid references practices(id) on delete cascade,
  patient_id uuid references patients(id) on delete cascade,
  submitted_by uuid not null references profiles(id) on delete cascade,
  points jsonb not null default '[]', -- [{ x, y, view, intensity, label, notes }]
  body_view text not null default 'anterior', -- anterior, posterior, lateral_left, lateral_right
  is_self_report boolean not null default false,
  session_notes text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- PULSE DIAGNOSES
-- ============================================================

create table pulse_diagnoses (
  id uuid primary key default uuid_generate_v4(),
  practice_id uuid not null references practices(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  practitioner_id uuid not null references profiles(id) on delete cascade,
  -- Six positions: left/right × cun/guan/chi
  left_cun jsonb default '{}',     -- { qualities: [], organ: 'Heart/Small Intestine', rate, depth, strength, notes }
  left_guan jsonb default '{}',    -- { qualities: [], organ: 'Liver/Gallbladder', ... }
  left_chi jsonb default '{}',     -- { qualities: [], organ: 'Kidney Yin/Bladder', ... }
  right_cun jsonb default '{}',    -- { qualities: [], organ: 'Lung/Large Intestine', ... }
  right_guan jsonb default '{}',   -- { qualities: [], organ: 'Spleen/Stomach', ... }
  right_chi jsonb default '{}',    -- { qualities: [], organ: 'Kidney Yang/Ming Men', ... }
  overall_rate integer,            -- beats per minute
  overall_notes text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- PATTERN DIFFERENTIATIONS
-- ============================================================

create table pattern_differentiations (
  id uuid primary key default uuid_generate_v4(),
  practice_id uuid not null references practices(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  practitioner_id uuid not null references profiles(id) on delete cascade,
  -- Input data references
  tongue_analysis_id uuid references tongue_analyses(id) on delete set null,
  pulse_diagnosis_id uuid references pulse_diagnoses(id) on delete set null,
  -- Symptoms and signs
  symptoms text[] default '{}',
  signs text[] default '{}',
  -- Differentiation results
  primary_pattern text,
  secondary_patterns text[] default '{}',
  eight_principles jsonb default '{}', -- { yin_yang, interior_exterior, cold_heat, deficiency_excess }
  zang_fu_patterns text[] default '{}',
  qi_blood_fluid text[] default '{}',
  six_stages text,
  four_levels text,
  san_jiao text,
  -- AI analysis
  ai_analysis text,
  ai_confidence numeric(3,2),
  practitioner_notes text,
  treatment_principles text[] default '{}',
  created_at timestamptz not null default now()
);

-- ============================================================
-- TREATMENT RECORDS
-- ============================================================

create table treatment_records (
  id uuid primary key default uuid_generate_v4(),
  practice_id uuid not null references practices(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  practitioner_id uuid not null references profiles(id) on delete cascade,
  clinical_note_id uuid references clinical_notes(id) on delete set null,
  appointment_id uuid references appointments(id) on delete set null,
  treatment_date timestamptz not null default now(),
  -- Acupuncture
  acupuncture_points jsonb default '[]', -- [{ point, technique, retention_time, sensation }]
  needle_technique text,
  retention_time integer, -- minutes
  -- Other modalities
  moxa_applied boolean default false,
  moxa_details text,
  cupping_applied boolean default false,
  cupping_details text,
  tuina_applied boolean default false,
  tuina_details text,
  electroacupuncture boolean default false,
  electroacupuncture_details text,
  gua_sha boolean default false,
  gua_sha_details text,
  -- Herbs
  herbal_formula_id uuid,
  herbal_notes text,
  -- Lifestyle recommendations
  dietary_advice text,
  exercise_recommendations text,
  lifestyle_notes text,
  -- Follow-up
  follow_up_plan text,
  patient_response text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- HERBAL FORMULAS
-- ============================================================

create table herbal_formulas (
  id uuid primary key default uuid_generate_v4(),
  practice_id uuid not null references practices(id) on delete cascade,
  practitioner_id uuid not null references profiles(id) on delete cascade,
  patient_id uuid references patients(id) on delete set null,
  name text not null,
  chinese_name text,
  source_text text, -- classical reference
  category text,
  actions text,
  indications text,
  contraindications text,
  herbs jsonb not null default '[]', -- [{ pin_yin, english, latin, dosage, unit, role, notes }]
  modifications text,
  preparation_method text,
  dosage_instructions text,
  is_template boolean not null default false, -- reusable template
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- INVOICES
-- ============================================================

create table invoices (
  id uuid primary key default uuid_generate_v4(),
  practice_id uuid not null references practices(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  invoice_number text not null,
  status invoice_status not null default 'draft',
  issue_date date not null default current_date,
  due_date date not null default (current_date + interval '30 days'),
  subtotal numeric(10,2) not null default 0,
  tax_rate numeric(5,4) default 0,
  tax_amount numeric(10,2) default 0,
  discount numeric(10,2) default 0,
  total numeric(10,2) not null default 0,
  amount_paid numeric(10,2) default 0,
  notes text,
  items jsonb not null default '[]', -- [{ description, quantity, unit_price, amount }]
  payment_history jsonb default '[]', -- [{ date, amount, method, reference }]
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- MESSAGES
-- ============================================================

create table messages (
  id uuid primary key default uuid_generate_v4(),
  practice_id uuid not null references practices(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  content text not null,
  message_type message_type not null default 'text',
  attachment_url text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- HOMEWORK / EXERCISES
-- ============================================================

create table homework (
  id uuid primary key default uuid_generate_v4(),
  practice_id uuid not null references practices(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  practitioner_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text,
  category text, -- 'acupressure', 'qi_gong', 'dietary', 'lifestyle', 'exercise'
  instructions text,
  frequency text, -- 'daily', '2x daily', 'as needed'
  duration text, -- '5 minutes', '15 minutes'
  media_url text, -- image or video reference
  status homework_status not null default 'assigned',
  due_date date,
  completed_at timestamptz,
  patient_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- SYMPTOM DIARY
-- ============================================================

create table symptom_diary (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references patients(id) on delete cascade,
  practice_id uuid not null references practices(id) on delete cascade,
  entry_date date not null default current_date,
  energy_level integer check (energy_level between 1 and 10),
  sleep_quality integer check (sleep_quality between 1 and 10),
  sleep_hours numeric(3,1),
  digestion integer check (digestion between 1 and 10),
  pain_level integer check (pain_level between 0 and 10),
  mood integer check (mood between 1 and 10),
  stress_level integer check (stress_level between 1 and 10),
  appetite text,
  bowel_movements text,
  menstrual_notes text,
  emotional_state text,
  custom_symptoms jsonb default '{}',
  notes text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

alter table profiles enable row level security;
alter table practices enable row level security;
alter table patients enable row level security;
alter table appointments enable row level security;
alter table clinical_notes enable row level security;
alter table tongue_analyses enable row level security;
alter table trigger_point_maps enable row level security;
alter table pulse_diagnoses enable row level security;
alter table pattern_differentiations enable row level security;
alter table treatment_records enable row level security;
alter table herbal_formulas enable row level security;
alter table invoices enable row level security;
alter table messages enable row level security;
alter table homework enable row level security;
alter table symptom_diary enable row level security;

-- Profiles: users can read/update their own profile
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Practitioners can view patient profiles linked to their practice
create policy "Practitioners can view patient profiles" on profiles for select using (
  exists (
    select 1 from patients p
    join practices pr on p.practice_id = pr.id
    where p.user_id = profiles.id and pr.owner_id = auth.uid()
  )
);

-- Practices: owner full access
create policy "Practice owner full access" on practices for all using (owner_id = auth.uid());

-- Patients can view practice they belong to
create policy "Patients can view their practice" on practices for select using (
  exists (
    select 1 from patients where practice_id = practices.id and user_id = auth.uid()
  )
);

-- Patients: practice owner full access
create policy "Practice owner manages patients" on patients for all using (
  exists (select 1 from practices where id = patients.practice_id and owner_id = auth.uid())
);

-- Patients can view own record
create policy "Patients can view own record" on patients for select using (user_id = auth.uid());
create policy "Patients can update own record" on patients for update using (user_id = auth.uid());

-- Appointments: practice owner full access
create policy "Practice owner manages appointments" on appointments for all using (
  exists (select 1 from practices where id = appointments.practice_id and owner_id = auth.uid())
);

-- Patients can view own appointments
create policy "Patients can view own appointments" on appointments for select using (
  exists (select 1 from patients where id = appointments.patient_id and user_id = auth.uid())
);

-- Clinical notes: practice owner full access
create policy "Practice owner manages notes" on clinical_notes for all using (
  exists (select 1 from practices where id = clinical_notes.practice_id and owner_id = auth.uid())
);

-- Patients can view notes marked visible
create policy "Patients can view visible notes" on clinical_notes for select using (
  patient_visible = true and exists (
    select 1 from patients where id = clinical_notes.patient_id and user_id = auth.uid()
  )
);

-- Tongue analyses: practice owner and submitter access
create policy "Practice owner manages tongue analyses" on tongue_analyses for all using (
  practice_id is null and submitted_by = auth.uid()
  or exists (select 1 from practices where id = tongue_analyses.practice_id and owner_id = auth.uid())
);

create policy "Patients can manage own tongue analyses" on tongue_analyses for all using (submitted_by = auth.uid());

-- Trigger point maps: similar pattern
create policy "Practice owner manages trigger points" on trigger_point_maps for all using (
  exists (select 1 from practices where id = trigger_point_maps.practice_id and owner_id = auth.uid())
);

create policy "Patients can manage own trigger points" on trigger_point_maps for all using (submitted_by = auth.uid());

-- Pulse diagnoses: practice owner
create policy "Practice owner manages pulse diagnoses" on pulse_diagnoses for all using (
  exists (select 1 from practices where id = pulse_diagnoses.practice_id and owner_id = auth.uid())
);

create policy "Patients can view own pulse diagnoses" on pulse_diagnoses for select using (
  exists (select 1 from patients where id = pulse_diagnoses.patient_id and user_id = auth.uid())
);

-- Pattern differentiations: practice owner
create policy "Practice owner manages patterns" on pattern_differentiations for all using (
  exists (select 1 from practices where id = pattern_differentiations.practice_id and owner_id = auth.uid())
);

create policy "Patients can view own patterns" on pattern_differentiations for select using (
  exists (select 1 from patients where id = pattern_differentiations.patient_id and user_id = auth.uid())
);

-- Treatment records: practice owner full access
create policy "Practice owner manages treatments" on treatment_records for all using (
  exists (select 1 from practices where id = treatment_records.practice_id and owner_id = auth.uid())
);

create policy "Patients can view own treatments" on treatment_records for select using (
  exists (select 1 from patients where id = treatment_records.patient_id and user_id = auth.uid())
);

-- Herbal formulas: practice owner
create policy "Practice owner manages formulas" on herbal_formulas for all using (
  exists (select 1 from practices where id = herbal_formulas.practice_id and owner_id = auth.uid())
);

create policy "Patients can view own formulas" on herbal_formulas for select using (
  patient_id is not null and exists (
    select 1 from patients where id = herbal_formulas.patient_id and user_id = auth.uid()
  )
);

-- Invoices: practice owner
create policy "Practice owner manages invoices" on invoices for all using (
  exists (select 1 from practices where id = invoices.practice_id and owner_id = auth.uid())
);

create policy "Patients can view own invoices" on invoices for select using (
  exists (select 1 from patients where id = invoices.patient_id and user_id = auth.uid())
);

-- Messages: practice owner and participants
create policy "Practice owner manages messages" on messages for all using (
  exists (select 1 from practices where id = messages.practice_id and owner_id = auth.uid())
);

create policy "Patients can view own messages" on messages for select using (
  exists (select 1 from patients where id = messages.patient_id and user_id = auth.uid())
);

create policy "Patients can send messages" on messages for insert with check (
  sender_id = auth.uid() and exists (
    select 1 from patients where id = messages.patient_id and user_id = auth.uid()
  )
);

-- Homework: practice owner and patient
create policy "Practice owner manages homework" on homework for all using (
  exists (select 1 from practices where id = homework.practice_id and owner_id = auth.uid())
);

create policy "Patients can view own homework" on homework for select using (
  exists (select 1 from patients where id = homework.patient_id and user_id = auth.uid())
);

create policy "Patients can update own homework" on homework for update using (
  exists (select 1 from patients where id = homework.patient_id and user_id = auth.uid())
);

-- Symptom diary: patient owns, practitioner can view
create policy "Patients manage own diary" on symptom_diary for all using (
  exists (select 1 from patients where id = symptom_diary.patient_id and user_id = auth.uid())
);

create policy "Practice owner views diary" on symptom_diary for select using (
  exists (select 1 from practices where id = symptom_diary.practice_id and owner_id = auth.uid())
);

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_patients_practice on patients(practice_id);
create index idx_patients_user on patients(user_id);
create index idx_appointments_practice on appointments(practice_id);
create index idx_appointments_patient on appointments(patient_id);
create index idx_appointments_start on appointments(start_time);
create index idx_clinical_notes_patient on clinical_notes(patient_id);
create index idx_tongue_analyses_patient on tongue_analyses(patient_id);
create index idx_trigger_points_patient on trigger_point_maps(patient_id);
create index idx_treatment_records_patient on treatment_records(patient_id);
create index idx_invoices_patient on invoices(patient_id);
create index idx_messages_patient on messages(patient_id);
create index idx_messages_created on messages(created_at);
create index idx_symptom_diary_patient on symptom_diary(patient_id);
create index idx_symptom_diary_date on symptom_diary(entry_date);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-update updated_at timestamp
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply to all tables with updated_at
create trigger update_profiles_updated_at before update on profiles for each row execute function update_updated_at();
create trigger update_practices_updated_at before update on practices for each row execute function update_updated_at();
create trigger update_patients_updated_at before update on patients for each row execute function update_updated_at();
create trigger update_appointments_updated_at before update on appointments for each row execute function update_updated_at();
create trigger update_clinical_notes_updated_at before update on clinical_notes for each row execute function update_updated_at();
create trigger update_treatment_records_updated_at before update on treatment_records for each row execute function update_updated_at();
create trigger update_herbal_formulas_updated_at before update on herbal_formulas for each row execute function update_updated_at();
create trigger update_invoices_updated_at before update on invoices for each row execute function update_updated_at();
create trigger update_homework_updated_at before update on homework for each row execute function update_updated_at();

-- Generate invoice number
create or replace function generate_invoice_number(p_practice_id uuid)
returns text as $$
declare
  next_num integer;
begin
  select coalesce(max(cast(substring(invoice_number from 5) as integer)), 0) + 1
  into next_num
  from invoices
  where practice_id = p_practice_id;
  return 'INV-' || lpad(next_num::text, 5, '0');
end;
$$ language plpgsql;

-- Handle new user signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'practitioner')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

insert into storage.buckets (id, name, public)
values
  ('tongue-images', 'tongue-images', false),
  ('avatars', 'avatars', true),
  ('attachments', 'attachments', false);

-- Storage policies
create policy "Authenticated users can upload tongue images"
  on storage.objects for insert
  with check (bucket_id = 'tongue-images' and auth.role() = 'authenticated');

create policy "Users can view own tongue images"
  on storage.objects for select
  using (bucket_id = 'tongue-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Practice owners can view patient tongue images"
  on storage.objects for select
  using (bucket_id = 'tongue-images' and auth.role() = 'authenticated');

create policy "Anyone can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload avatars"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Authenticated users can manage attachments"
  on storage.objects for all
  using (bucket_id = 'attachments' and auth.role() = 'authenticated');

-- ============================================================
-- REALTIME
-- ============================================================

alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table appointments;
