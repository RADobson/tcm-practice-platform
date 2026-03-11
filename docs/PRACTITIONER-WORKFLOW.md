# Consult Results — Practitioner Workflow

> How a TCM practitioner actually uses the platform, from patient booking to post-consultation email.

---

## Before the Patient Arrives

### 1. Patient Books Online
**Portal:** `/portal/appointments`

- New patient receives an invite link → creates their portal account
- Portal prompts them to complete the **AI Intake Form** (`/portal/intake`)
- Comprehensive questionnaire covering: chief complaint, medical history, medications, sleep, digestion, emotions, energy, pain, temperature, sweating, menstrual cycle
- AI pre-analyses responses → generates a **pre-consultation brief** for the practitioner
- Red flag detection (unexplained weight loss, chest pain → referral warning)

### 2. Patient Does Tongue Self-Assessment at Home
**Portal:** `/portal/tongue`

- Patient takes a photo of their tongue on their phone
- AI analyses it immediately: colour, coating, shape, moisture, sublingual veins, organ region mapping
- Results shared with the practitioner before the patient walks in

### 3. Patient Marks Pain/Tension Points
**Portal:** `/portal/body-map`

- Interactive body diagram on their phone
- Marks where it hurts plus intensity level
- Practitioner sees this in real-time on their dashboard

### What the Practitioner Has Before the Patient Walks In

- Full health history (AI-summarised)
- Tongue diagnosis (AI-analysed)
- Pain map (self-reported)
- Red flags identified
- Likely TCM patterns suggested

**The practitioner is not starting from scratch — they're confirming or refining.**

---

## Patient Arrives — Consultation

### 4. Review the Pre-Consultation Brief
**Dashboard:** `/dashboard/patients/[id]`

- AI has already identified likely patterns from intake + tongue photo
- Practitioner knows what questions to dig into
- Quick glance, not a deep read — the data is structured and prioritised

### 5. Hit Record on the Consultation
**Dashboard:** `/dashboard/consultation-recorder`

- Browser-based audio recording (MediaRecorder API)
- Practitioner talks to the patient normally — no typing, no clipboard
- Discusses chief complaint, asks follow-up questions, explains their assessment
- The conversation IS the clinical documentation

### 6. Four Examinations (四诊) — Digitally Captured

**Inspection (望 wàng):**
- Tongue diagnosis already done via AI photo analysis (`/dashboard/diagnostics/tongue`)
- Practitioner can do a second in-clinic photo if needed
- Complexion, spirit, body type — captured verbally during recorded consultation

**Auscultation & Olfaction (闻 wén):**
- Voice quality, breathing patterns, body odour — mentioned verbally during recorded consultation
- Transcription captures these observations

**Inquiry (问 wèn):**
- The AI intake form already covered the 10 traditional questions
- Recorded conversation fills gaps and captures nuance

**Palpation (切 qiè):**

*Pulse Diagnosis* → `/dashboard/diagnostics/pulse`
- Structured input for all 28 classical pulse qualities (floating, sinking, rapid, slow, wiry, slippery, choppy, etc.)
- Three positions per hand:
  - Left hand: Heart (cun), Liver (guan), Kidney Yin (chi)
  - Right hand: Lung (cun), Spleen (guan), Kidney Yang (chi)
- Each position recorded at superficial, middle, and deep levels

*Trigger Points / Ah Shi Points* → `/dashboard/diagnostics/trigger-points`
- Interactive body map — practitioner taps where they find tenderness
- Marks intensity (mild/moderate/severe) + pressure feedback from patient
- Real-time sync via Supabase Realtime

---

## Pattern Differentiation

### 7. AI Pattern Synthesis
**Dashboard:** `/dashboard/diagnostics/ai-synthesis`

Combines ALL collected data:
- Tongue analysis + Pulse diagnosis + Symptoms + Intake responses + Trigger points

Produces ranked differential diagnosis with confidence scores, mapped to:
- Zang-Fu organ patterns
- Eight Principles (八纲)
- Six Stages (六经) where applicable

Example output:
```
1. Liver Qi Stagnation (肝气郁结) — 87% confidence
2. Spleen Qi Deficiency (脾气虚) — 72% confidence
3. Blood Stasis (血瘀) — 45% confidence
```

Practitioner confirms, adjusts, or overrides based on clinical judgment.

### 8. Confirm the Pattern
**Dashboard:** `/dashboard/diagnostics/patterns`

- Save the confirmed diagnosis
- This drives everything downstream: treatment planning, herbal prescribing, and the post-consultation email enrichment

---

## Treatment Planning & Execution

### 9. AI Treatment Planner
**Dashboard:** `/dashboard/diagnostics/treatment-plan`

Given the confirmed pattern, the AI suggests:
- Acupuncture point protocol with clinical reasoning for each point
- Needling technique per point (tonify 补 / reduce 泻 / even 平补平泻)
- Adjunct therapies: cupping (拔罐), gua sha (刮痧), moxibustion (灸法), ear seeds (耳穴), electroacupuncture (电针)

Practitioner modifies as needed. The AI suggests — the practitioner decides.

### 10. AI Herbal Prescriber (if prescribing herbs)
**Dashboard:** `/dashboard/diagnostics/herbal-ai`

- Suggests classical base formula with modifications for this patient
- Example: Xiao Yao San (逍遥散) for Liver Qi Stagnation with Spleen Deficiency
- Herbs displayed with Pin Yin, English, and Latin names
- Standard dosages, contraindications, herb-herb interactions, pregnancy warnings
- References canonical formulas: Gui Zhi Tang, Si Jun Zi Tang, Liu Wei Di Huang Wan, Bu Zhong Yi Qi Tang, etc.

### 11. Treat the Patient

- Needle the points, apply moxa/cupping as planned
- The audio is still recording throughout
- Practitioner explains to the patient what they're doing:
  *"I'm needling Liver 3, Tai Chong, with even technique to smooth your Liver Qi..."*
- This verbal explanation gets transcribed and enriches the clinical notes

---

## Post-Treatment

### 12. Stop Recording — Auto-Transcription
**Dashboard:** `/dashboard/consultation-recorder` → `/dashboard/notes`

Pipeline:
1. Whisper transcribes the full consultation audio
2. GPT-4o extracts structured **SOAP notes** from the transcript:
   - **S**ubjective: Patient's complaints in their own words
   - **O**bjective: Tongue, pulse, palpation findings
   - **A**ssessment: Confirmed TCM pattern diagnosis
   - **P**lan: Points used, techniques applied, herbs prescribed, lifestyle advice given
3. Auto-populates the clinical notes form
4. Practitioner reviews and signs off

**Time saved: 15 minutes of documentation → 30 seconds of review.**

### 13. Mark Consultation as Complete

This triggers the post-consultation email pipeline.

---

## The Post-Consultation Email (The Showstopper)

### 14. AI Enrichment Pipeline Fires
**API:** `/api/post-consultation`

The AI agent reads:
- Full transcription
- Structured SOAP notes
- Confirmed TCM pattern diagnosis
- Points used and techniques applied
- Herbs prescribed (if any)

And enriches with:
- **Modern research:** Evidence-based studies on the acupuncture points used and the diagnosed pattern
- **Classical TCM texts:** Relevant passages from the Huang Di Nei Jing (黄帝内经), Shang Han Lun (伤寒论), Nan Jing (难经), Ling Shu (灵枢), Ben Cao Gang Mu (本草纲目)
- **Personalised lifestyle tips:** Diet, exercise, sleep, emotional guidance — specific to their diagnosed pattern and Five Element constitution
- **Dietary therapy:** Warming/cooling foods, flavour-organ associations, seasonal eating advice based on TCM food energetics

### 15. 3D Meridian Visualization Generated

- Patient's body rendered in 3D with all 14 meridians (12 primary + Du Mai + Ren Mai)
- Points used in treatment highlighted with technique indicators (tonify/reduce/even/moxa/cupping)
- **BEFORE animation:** Shows the pathology
  - Stagnation → blocked, dim flow along affected meridians
  - Deficiency → thin, weak, flickering flow
  - Excess → congested, bright, pulsing flow
  - Heat → red glow along meridian
  - Cold → blue tinge along meridian
- **AFTER animation:** Shows restored flow
  - Previously blocked areas now flowing smoothly
  - Deficient areas strengthened and brightened
  - Excess dispersed and normalised

### 16. Email Sent Automatically
**Template:** Mobile-responsive HTML email

Contains:
- Treatment date, practitioner name, patient name
- Plain-language treatment summary (no jargon)
- Key insights from classical texts (with citations)
- Personalised lifestyle recommendations
- Prominent CTA button: **"View Your Treatment Visualization →"**
- Next appointment reminder (if scheduled)
- Links to token-gated visualization page (`/results/[token]`)

### 17. Patient Experience

The patient opens the email and:
1. **Reads their summary** — actually understands what happened in their treatment
2. **Clicks the 3D visualization** — rotates the body, zooms in, clicks individual points
3. **Sees the before/after qi flow animation** — visualises the therapeutic change
4. **Reads the classical references** — feels the depth of tradition behind their treatment
5. **Gets actionable lifestyle tips** — knows exactly what to eat, how to sleep, what to avoid

The reaction: *"No practitioner has ever shown me this before."*

They show their partner, their friends, they post it on social media → **organic word-of-mouth marketing for the practitioner.**

---

## Ongoing Patient Engagement

### 18. Symptom Diary
**Portal:** `/portal/diary`

- Daily check-ins: energy, sleep, digestion, pain, mood
- Tracks trends between appointments
- Patient feels engaged in their own healing process

### 19. Next Visit

The cycle repeats, but now the practitioner has:
- Full treatment history with previous SOAP notes
- Symptom diary trends showing what improved (or didn't)
- Previous pattern diagnoses to compare against
- Previous treatment protocols to build upon
- The AI gets smarter with more longitudinal data about this specific patient

### 20. Health Timeline
**Portal:** `/portal/timeline`

- Visual timeline of all treatments + symptom trends
- Patient and practitioner can see the trajectory of care
- Powerful for long-term chronic conditions

---

## Billing

### 21. Invoice Generated
**Dashboard:** `/dashboard/billing`

- Auto-generated from the completed appointment
- Workflow: Draft → Sent → Paid → Overdue
- Payment tracking and history

---

## The Key Insight

> **The practitioner barely types anything.**

They talk to the patient. They tap a few buttons for pulse and trigger points. They confirm the AI's pattern diagnosis. They review the auto-generated SOAP notes.

The platform turns a **15-minute documentation burden into a 30-second review** — and produces a patient experience that no competitor can match.

The post-consultation email isn't just a receipt. It's a **marketing engine disguised as patient care.**

---

## Platform Routes Summary

| Stage | Practitioner Dashboard | Patient Portal |
|-------|----------------------|----------------|
| Booking | `/dashboard/appointments` | `/portal/appointments` |
| Intake | Reviews AI brief on patient page | `/portal/intake` |
| Tongue | `/dashboard/diagnostics/tongue` | `/portal/tongue` |
| Body Map | `/dashboard/diagnostics/trigger-points` | `/portal/body-map` |
| Pulse | `/dashboard/diagnostics/pulse` | — |
| Pattern Synthesis | `/dashboard/diagnostics/ai-synthesis` | — |
| Pattern Confirmation | `/dashboard/diagnostics/patterns` | — |
| Treatment Plan | `/dashboard/diagnostics/treatment-plan` | — |
| Herbal Prescribing | `/dashboard/diagnostics/herbal-ai` | — |
| Herbs/Formulas | `/dashboard/herbs` | — |
| Recording | `/dashboard/consultation-recorder` | — |
| SOAP Notes | `/dashboard/notes` | — |
| Post-Consult Email | Auto-triggered on completion | Received via email |
| 3D Visualization | — | `/results/[token]` |
| Symptom Diary | — | `/portal/diary` |
| Treatment History | `/dashboard/treatments` | `/portal/treatments` |
| Timeline | — | `/portal/timeline` |
| Messaging | `/dashboard` (via patient page) | `/portal/messages` |
| Billing | `/dashboard/billing` | — |
| Analytics | `/dashboard/analytics` | — |
| Export | `/dashboard/export` | — |
| Settings | `/dashboard/settings` | — |

---

*© 2026 Consult Results. Built by a practitioner, for practitioners.*
