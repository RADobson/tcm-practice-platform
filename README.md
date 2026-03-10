# Consult Results

AI-powered practice management for acupuncturists and TCM practitioners.

Built by a former acupuncturist with 15 years of clinical experience. Every feature — from tongue diagnosis to herbal prescribing — was designed by someone who's actually done this work.

**Live:** consultresults.online (coming soon)

---

## What It Does

### For Practitioners (Dashboard)

**Patient Management**
- Add, search, and manage patient records
- Clinical history, treatment timeline, notes

**Appointments**
- Calendar view, booking management
- Automated reminders

**Clinical Notes (SOAP)**
- Structured Subjective, Objective, Assessment, Plan notes per visit
- Auto-generated from AI consultation transcription

**TCM Diagnostics Suite**
- **AI Tongue Diagnosis** — patient takes a photo, OpenAI Vision analyses tongue body colour, coating, shape, moisture, sublingual veins, mapped to organ regions (tip=Heart/Lung, centre=Spleen/Stomach, sides=Liver/Gallbladder, root=Kidney/Bladder/Intestines)
- **Trigger Point Mapping** — interactive SVG body diagram with real-time multi-point marking, pain intensity (mild/moderate/severe), pressure feedback signals
- **Pulse Diagnosis** — structured input for 28 classical pulse qualities (floating, sinking, rapid, slow, wiry, slippery, choppy, etc.)
- **AI Pattern Synthesis** — combines tongue + pulse + symptoms → ranked differential diagnosis with confidence scores, mapped to Zang-Fu, Eight Principles, Six Stages
- **AI Treatment Planner** — given a pattern, suggests acupuncture point protocols with clinical reasoning, needling technique, adjunct therapies (cupping, gua sha, moxa, ear seeds)

**AI Herbal Prescriber**
- Input pattern diagnosis and symptoms
- AI suggests classical base formula with modifications
- Herbs displayed with Pin Yin, English, and Latin names
- Standard dosages, contraindications, herb-herb interactions, pregnancy warnings
- References: Gui Zhi Tang, Si Jun Zi Tang, Liu Wei Di Huang Wan, Xiao Yao San, Bu Zhong Yi Qi Tang, etc.

**Consultation Audio Transcription**
- Record audio during session via browser MediaRecorder API
- OpenAI Whisper transcription
- GPT-4o extracts structured SOAP notes from transcript
- Auto-populates notes form for practitioner review

**Herbal Formula Builder**
- Search Chinese herbs by Pin Yin, English, or Latin name
- Build custom formulas, save templates
- Dosage tracking

**Billing & Invoicing**
- Invoice generation, payment tracking
- Draft → Sent → Paid → Overdue workflow

**Analytics Dashboard**
- Patient volume, revenue, common presentations
- Practice insights

**Export**
- Patient records and clinical notes as PDF

### For Patients (Portal)

**Appointment Management**
- View upcoming appointments, request bookings

**Tongue Self-Assessment**
- Take tongue photos, see AI analysis
- Share results with practitioner

**Body Map Self-Report**
- Mark current pain/tension points before appointment
- Practitioner sees markers in real-time during session

**Patient Intake AI**
- Comprehensive digital intake form (chief complaint, medical history, medications, sleep, digestion, emotions, energy, pain, temperature, sweating, menstrual)
- AI pre-analyses responses and generates pre-consultation brief for practitioner
- Red flag detection (unexplained weight loss, chest pain → referral warning)

**Symptom Diary**
- Daily check-in: energy, sleep, digestion, pain, mood
- Tracks trends over time

**Treatment History**
- View past visits and practitioner notes (visibility controlled by practitioner)

**Secure Messaging**
- Patient-practitioner chat

**Health Timeline**
- Visual timeline of treatments + symptom trends

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Next.js API Routes |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Auth | Supabase Auth (email + password, role-based) |
| Storage | Supabase Storage (tongue images, audio recordings) |
| AI — Vision | OpenAI GPT-4o (tongue analysis, pattern synthesis) |
| AI — Audio | OpenAI Whisper (consultation transcription) |
| AI — Text | OpenAI GPT-4o (herbal prescriber, treatment planner, intake analysis, SOAP extraction) |
| Realtime | Supabase Realtime (trigger point sync, messaging) |

---

## Architecture

```
/auth/*                  — Login, signup, patient invite acceptance
/dashboard/*             — Practitioner routes (protected)
  /dashboard/patients    — Patient management
  /dashboard/appointments — Calendar + scheduling
  /dashboard/notes       — SOAP clinical notes
  /dashboard/diagnostics/
    /tongue              — AI tongue diagnosis
    /trigger-points      — Body map
    /pulse               — Pulse diagnosis
    /patterns            — Pattern differentiation
    /ai-synthesis        — AI pattern synthesis (combines all data)
    /treatment-plan      — AI treatment planning
    /herbal-ai           — AI herbal prescriber
  /dashboard/consultation-recorder — Audio transcription
  /dashboard/herbs       — Herbal formula builder
  /dashboard/billing     — Invoicing
  /dashboard/analytics   — Practice analytics
  /dashboard/export      — PDF export
  /dashboard/treatments  — Treatment records
  /dashboard/settings    — Practice settings
/portal/*                — Patient routes (protected, patient role)
  /portal/appointments   — View/request appointments
  /portal/tongue         — Tongue self-assessment
  /portal/body-map       — Pain/tension self-report
  /portal/intake         — AI intake form
  /portal/diary          — Symptom diary
  /portal/treatments     — Treatment history
  /portal/messages       — Secure messaging
  /portal/timeline       — Health timeline
/api/*                   — API routes for all features
```

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/RADobson/tcm-practice-platform.git
cd tcm-practice-platform
npm install
```

### 2. Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL Editor
3. Copy your project URL and anon key

### 3. Environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
OPENAI_API_KEY=your-openai-api-key
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Deploy

```bash
# Vercel (recommended)
vercel --prod

# Set environment variables in Vercel dashboard
```

---

## Database Schema

See `supabase/schema.sql` for the complete schema including:
- Profiles (practitioner + patient roles)
- Practices (clinic details)
- Patients (linked to practices)
- Appointments (scheduling + status workflow)
- Clinical notes (SOAP format)
- Tongue analyses (AI results + images)
- Trigger point sessions (body map data)
- Pulse records (28 pulse qualities)
- Pattern diagnoses
- Treatment records (points, techniques, herbs)
- Herbal formulas + formula items
- Invoices + line items
- Messages (patient-practitioner)
- Symptom diary entries
- Patient intake forms + AI analysis
- Consultation recordings + transcriptions
- Row Level Security policies for data isolation

---

## AI Features

All AI outputs include the disclaimer: *"This is an AI-assisted analysis tool. It does not replace clinical diagnosis by a qualified practitioner."*

| Feature | Model | Input | Output |
|---------|-------|-------|--------|
| Tongue Diagnosis | GPT-4o Vision | Tongue photo | Colour, coating, shape, moisture, sublingual veins, organ mapping, pattern identification |
| Pattern Synthesis | GPT-4o | Tongue + pulse + symptoms + intake | Ranked differential diagnosis with confidence scores |
| Herbal Prescriber | GPT-4o | Pattern diagnosis + symptoms | Classical formula + modifications, dosages, contraindications |
| Treatment Planner | GPT-4o | Confirmed pattern | Point protocol with reasoning, needling technique, adjuncts |
| Consultation Transcription | Whisper + GPT-4o | Audio recording | Transcript → structured SOAP notes |
| Patient Intake Analysis | GPT-4o | Intake form responses | Pre-consultation brief, likely patterns, red flags |

---

## Repos

| Repo | Description |
|------|-------------|
| [tcm-practice-platform](https://github.com/RADobson/tcm-practice-platform) | Main platform (this repo) |
| [trigger-point-pro](https://github.com/RADobson/trigger-point-pro) | Standalone trigger point mapping app (Phase 1) |
| [tcm-tongue-analysis](https://github.com/RADobson/tcm-tongue-analysis) | Standalone tongue analysis app (Phase 2) |
| [zhenai-landing](https://github.com/RADobson/zhenai-landing) | Landing page + waitlist |

---

## Pricing (Planned)

| Tier | Price | Patients | AI Features |
|------|-------|----------|-------------|
| Free | $0/mo | 5 | Limited (5 tongue analyses/mo) |
| Pro | $49/mo | Unlimited | Full AI suite |
| Clinic | $99/mo | Unlimited + multi-practitioner | Full AI + analytics + priority support |

---

## Licence

Proprietary. All rights reserved.

© 2026 Consult Results. Built in Australia.
