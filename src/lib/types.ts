export type UserRole = 'practitioner' | 'patient';
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type MessageType = 'text' | 'image' | 'system';
export type HomeworkStatus = 'assigned' | 'in_progress' | 'completed';

export interface Profile {
  id: string;
  role: UserRole;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Practice {
  id: string;
  owner_id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  license_number?: string;
  specialties: string[];
  business_hours: Record<string, { open: string; close: string }>;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  practice_id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  chief_complaint?: string;
  medical_history?: string;
  medications?: string;
  allergies?: string;
  occupation?: string;
  referral_source?: string;
  notes?: string;
  invite_token?: string;
  invite_sent_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  practice_id: string;
  patient_id: string;
  practitioner_id: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  type: string;
  chief_complaint?: string;
  notes?: string;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
  patient?: Patient;
}

export interface ClinicalNote {
  id: string;
  practice_id: string;
  patient_id: string;
  practitioner_id: string;
  appointment_id?: string;
  visit_date: string;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  tongue_notes?: string;
  pulse_notes?: string;
  pattern_diagnosis?: string;
  patient_visible: boolean;
  is_signed: boolean;
  signed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TongueAnalysis {
  id: string;
  practice_id?: string;
  patient_id?: string;
  submitted_by: string;
  image_url: string;
  body_color?: string;
  body_shape?: string;
  coating_color?: string;
  coating_thickness?: string;
  coating_distribution?: string;
  moisture?: string;
  sublingual_veins?: string;
  movement?: string;
  spirit?: string;
  regions: Record<string, string>;
  ai_analysis?: string;
  ai_patterns: string[];
  practitioner_notes?: string;
  is_self_assessment: boolean;
  created_at: string;
}

export interface TriggerPointMap {
  id: string;
  practice_id?: string;
  patient_id?: string;
  submitted_by: string;
  points: TriggerPoint[];
  body_view: string;
  is_self_report: boolean;
  session_notes?: string;
  created_at: string;
}

export interface TriggerPoint {
  x: number;
  y: number;
  view: string;
  intensity: number;
  label?: string;
  notes?: string;
}

export interface PulsePosition {
  qualities: string[];
  organ: string;
  rate?: number;
  depth?: string;
  strength?: string;
  notes?: string;
}

export interface PulseDiagnosis {
  id: string;
  practice_id: string;
  patient_id: string;
  practitioner_id: string;
  left_cun: PulsePosition;
  left_guan: PulsePosition;
  left_chi: PulsePosition;
  right_cun: PulsePosition;
  right_guan: PulsePosition;
  right_chi: PulsePosition;
  overall_rate?: number;
  overall_notes?: string;
  created_at: string;
}

export interface PatternDifferentiation {
  id: string;
  practice_id: string;
  patient_id: string;
  practitioner_id: string;
  tongue_analysis_id?: string;
  pulse_diagnosis_id?: string;
  symptoms: string[];
  signs: string[];
  primary_pattern?: string;
  secondary_patterns: string[];
  eight_principles: {
    yin_yang?: string;
    interior_exterior?: string;
    cold_heat?: string;
    deficiency_excess?: string;
  };
  zang_fu_patterns: string[];
  qi_blood_fluid: string[];
  six_stages?: string;
  four_levels?: string;
  san_jiao?: string;
  ai_analysis?: string;
  ai_confidence?: number;
  practitioner_notes?: string;
  treatment_principles: string[];
  created_at: string;
}

export interface TreatmentRecord {
  id: string;
  practice_id: string;
  patient_id: string;
  practitioner_id: string;
  clinical_note_id?: string;
  appointment_id?: string;
  treatment_date: string;
  acupuncture_points: AcupuncturePoint[];
  needle_technique?: string;
  retention_time?: number;
  moxa_applied: boolean;
  moxa_details?: string;
  cupping_applied: boolean;
  cupping_details?: string;
  tuina_applied: boolean;
  tuina_details?: string;
  electroacupuncture: boolean;
  electroacupuncture_details?: string;
  gua_sha: boolean;
  gua_sha_details?: string;
  herbal_formula_id?: string;
  herbal_notes?: string;
  dietary_advice?: string;
  exercise_recommendations?: string;
  lifestyle_notes?: string;
  follow_up_plan?: string;
  patient_response?: string;
  created_at: string;
  updated_at: string;
}

export interface AcupuncturePoint {
  point: string;
  technique?: string;
  retention_time?: number;
  sensation?: string;
}

export interface HerbalFormula {
  id: string;
  practice_id: string;
  practitioner_id: string;
  patient_id?: string;
  name: string;
  chinese_name?: string;
  source_text?: string;
  category?: string;
  actions?: string;
  indications?: string;
  contraindications?: string;
  herbs: HerbEntry[];
  modifications?: string;
  preparation_method?: string;
  dosage_instructions?: string;
  is_template: boolean;
  created_at: string;
  updated_at: string;
}

export interface HerbEntry {
  pin_yin: string;
  english: string;
  latin: string;
  dosage: number;
  unit: string;
  role: string; // jun, chen, zuo, shi
  notes?: string;
}

export interface Invoice {
  id: string;
  practice_id: string;
  patient_id: string;
  invoice_number: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount: number;
  total: number;
  amount_paid: number;
  notes?: string;
  items: InvoiceItem[];
  payment_history: PaymentRecord[];
  created_at: string;
  updated_at: string;
  patient?: Patient;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface PaymentRecord {
  date: string;
  amount: number;
  method: string;
  reference?: string;
}

export interface Message {
  id: string;
  practice_id: string;
  patient_id: string;
  sender_id: string;
  content: string;
  message_type: MessageType;
  attachment_url?: string;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
}

export interface Homework {
  id: string;
  practice_id: string;
  patient_id: string;
  practitioner_id: string;
  title: string;
  description?: string;
  category?: string;
  instructions?: string;
  frequency?: string;
  duration?: string;
  media_url?: string;
  status: HomeworkStatus;
  due_date?: string;
  completed_at?: string;
  patient_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SymptomEntry {
  id: string;
  patient_id: string;
  practice_id: string;
  entry_date: string;
  energy_level?: number;
  sleep_quality?: number;
  sleep_hours?: number;
  digestion?: number;
  pain_level?: number;
  mood?: number;
  stress_level?: number;
  appetite?: string;
  bowel_movements?: string;
  menstrual_notes?: string;
  emotional_state?: string;
  custom_symptoms: Record<string, unknown>;
  notes?: string;
  created_at: string;
}
