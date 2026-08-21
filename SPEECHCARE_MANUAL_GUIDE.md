# 📘 SPEECHCARE AI — COMPLETE OPERATING & REFERENCE MANUAL
**Target Web Application**: https://terapyps-2-l98w.vercel.app/  
**Repository**: https://github.com/ullaspn402-boop/TERAPYPS2  

---

## 📋 Table of Contents
1. [Architecture Overview & Technology Stack](#1-architecture-overview--technology-stack)
2. [Role-Based Access System & Authentication](#2-role-based-access-system--authentication)
3. [Component-by-Component Operating Manual](#3-component-by-component-operating-manual)
   - [3.1 Sign-In Portal (LoginView)](#31-sign-in-portal-loginview)
   - [3.2 Top Navigation Header & Global Utilities](#32-top-navigation-header--global-utilities)
   - [3.3 Therapist Dashboard](#33-therapist-dashboard)
   - [3.4 Patient Detail View (6 Clinical Tabs)](#34-patient-detail-view-6-clinical-tabs)
   - [3.5 Speech Practice Studio (6 Languages)](#35-speech-practice-studio-6-languages)
   - [3.6 Local AI Therapist Assistant Co-Pilot](#36-local-ai-therapist-assistant-co-pilot)
   - [3.7 Adaptive Therapy Engine (5-Tier Continuum)](#37-adaptive-therapy-engine-5-tier-continuum)
   - [3.8 AI Case Allocation & Caseload Optimization](#38-ai-case-allocation--caseload-optimization)
   - [3.9 Supervisor Center (Priority Queue, Reviews, Competencies)](#39-supervisor-center-priority-queue-reviews-competencies)
   - [3.10 Institutional Clinical Analytics](#310-institutional-clinical-analytics)
4. [Local Rule-Based AI Engine Technical Specification](#4-local-rule-based-ai-engine-technical-specification)
5. [Troubleshooting & Verification Commands](#5-troubleshooting--verification-commands)

---

## 1. Architecture Overview & Technology Stack

| Layer | Technology Used | Purpose |
|---|---|---|
| **Frontend Framework** | React 19 + TypeScript + Vite | Single-page responsive client application |
| **Styling** | Vanilla CSS + TailwindCSS 4 | Modern clinical dark/light glassmorphic UI system |
| **Backend Framework** | Node.js + Express + TypeScript | RESTful API server with JWT authentication |
| **Database** | MongoDB Atlas (Mongoose ODM) | Multi-collection clinical record persistence |
| **AI Engine Layer** | Local Rule-Based Services | Deterministic clinical reasoning (No external LLM APIs) |
| **Deployment** | Vercel (Frontend) + Render (Backend) | CI/CD automated deployment pipeline |

---

## 2. Role-Based Access System & Authentication

Access is controlled via JWT tokens stored in `localStorage` under key `speechcare_token`.

### Seed Accounts:
1. **Student Therapist**:
   - Email: `ananya.sharma@speechcare.ai`
   - Password: `password123`
   - Role: `student_therapist`
   - Capabilities: Managing assigned caseload, logging sessions, live speech practice, AI assistant interaction, submitting therapy plans for supervisor review.

2. **Clinical Supervisor**:
   - Email: `sarah.mehta@speechcare.ai`
   - Password: `password123`
   - Role: `supervisor`
   - Capabilities: Reviewing AI Priority Queue, approving/rejecting therapy plans with AI quality check output, student competency evaluation.

3. **Administrator**:
   - Email: `admin@speechcare.ai`
   - Password: `password123`
   - Role: `admin`
   - Capabilities: Institutional analytics, language distribution tracking, user administration.

---

## 3. Component-by-Component Operating Manual

### 3.1 Sign-In Portal (`LoginView.tsx`)
- **Visuals**: Centered modal card with `#006A61` teal branding.
- **Controls**:
  - **Email & Password Fields**: Manual authentication.
  - **Sign In Button**: Sends `POST /api/auth/login`. On success, stores JWT token and navigates to role dashboard.
  - **Demo Account Buttons (Bottom)**: 1-click auto-fill buttons for Student Therapist, Clinical Supervisor, and Administrator.

---

### 3.2 Top Navigation Header & Global Utilities
- **Global Search (`GlobalSearchModal.tsx`)**:
  - Activated by clicking search bar or pressing `Ctrl + K`.
  - Filters across Patients, Cases, Target Sounds, and Statuses in real time.
- **Notification Drawer (`NotificationDrawer.tsx`)**:
  - Activated by clicking the Bell icon (`🔔`).
  - Displays unread badge counter. Fetches alerts from `GET /api/notifications`.
  - Notification Types: `milestone` (10-session milestone), `assignment` (AI case allocation match), `supervisor_feedback`, `ai_insight` (Adaptive progression alert), `review_required` (Documentation overdue warning).
- **Interface Language Switcher**:
  - Switches UI text presentation across supported languages.

---

### 3.3 Therapist Dashboard (`TherapistDashboard.tsx`)
- **Metric Cards**:
  - *Active Cases*: Count of allocated cases in active therapy status.
  - *Weekly Sessions*: Count of sessions completed during the current week (`GET /api/analytics/summary`).
  - *Reports Due*: Count of milestone cases pending 10-session progress summary.
- **My Active Cases Grid**:
  - Cards for *Rahul Verma* (`/r/`, Telugu), *Ananya Roy* (`/s/`, English), *Arjun Menon* (`/l/`, Malayalam), *Priya Iyer* (`/k/`, Tamil).
  - Shows progress bar, current level badge, and primary therapy language.
- **AI Clinical Assistant Widget (Right Side)**:
  - Displays current patient focus and recommended activity.
  - Contains **Approve** (Teal) and **Modify** (Amber) decision buttons.

---

### 3.4 Patient Detail View (`PatientDetailView.tsx`)
Contains 6 clinical tabs:
1. **Overview Tab**: Clinical profile, age, gender, primary language, therapy language, diagnosis, assigned therapist, and supervisor.
2. **Initial Assessment Tab**: Intake baseline scores across 5 continuum levels (*Sound, Syllable, Word, Sentence, Conversation*).
3. **Therapy Plan Tab**: Goal management list.
   - **Check AI Quality Button**: Calls `POST /api/ai/plan-quality`, evaluating 7 criteria.
   - **Submit for Review Button**: Calls `POST /api/therapy-plans/:id/submit`, transitioning status to `SUPERVISOR_REVIEW`.
4. **Sessions & SOAP Notes Tab**: Historical session log. Shows Subjective, Objective, Assessment, and Plan notes with supervisor rating.
5. **Speech & Acoustic Analysis Tab**: Position accuracy breakdown (*Initial, Medial, Final*), acoustic quality telemetry, and session score velocity graph.
6. **10-Session Milestone Tab**: Calls `POST /api/ai/progress-summary` to generate structured progress summaries comparing baseline vs. current performance.

---

### 3.5 Speech Practice Studio (`SpeechPracticeStudio.tsx`)
- **Language Selector Bar**:
  - Buttons for **English**, **Telugu (తెలుగు)**, **Kannada (ಕನ್ನಡ)**, **Hindi (हिन्दी)**, **Malayalam (മലയാളം)**, and **Tamil (தமிழ்)**.
  - Selecting a language filters `SPEECH_STIMULI_BANK` and loads target word prompts and carrier sentences in native script.
- **Stimulus Card**:
  - Large prompt text (e.g. `Raja / ರಾಜ / राजा / രാജാവ് / ராஜா`), phonetic IPA transcription, phonetic position, and clinician articulation tips.
- **Audio Reference Player (`Volume2`)**:
  - Plays standard reference audio for patient imitation.
- **Live Trial Recorder (`Mic`)**:
  - Click **Start Trial**: Activates `AudioVisualizer` waveform animation.
  - Click **Stop & Score Trial**: Computes accuracy score (e.g., `88%`) and appends trial item to the MongoDB trial log table.

---

### 3.6 Local AI Therapist Assistant Co-Pilot (`AIAssistantView.tsx`)
- **Contextual Quick Actions**:
  - 👤 **Summarize Patient**: Executes `POST /api/ai/assistant` with `patientId` to return clinical status summary.
  - 📝 **Draft Session Note**: Returns formatted SOAP Note draft based on recent session telemetry.
  - 💡 **Suggest Activities**: Returns level-specific minimal pair drills.
  - 📊 **Explain Progress**: Analyzes score trends and velocity.
- **AI Suggested Activities Panel (Right Side)**:
  - Cards displaying activity title, level, description, clinical rationale, target phoneme, and recommended duration.
  - **Decision Controls**:
    - **Approve**: Sets status to `approved` via `PUT /api/ai/activities/:id`.
    - **Modify**: Sets status to `modified`.
    - **Reject**: Sets status to `rejected`.

---

### 3.7 Adaptive Therapy Engine (`AdaptiveTherapyView.tsx`)
- **5-Tier Continuum Ladder**:
  - Visual tiers: *1. Sound (Isolation) ➔ 2. Syllable ➔ 3. Word ➔ 4. Sentence ➔ 5. Conversation*.
  - Configured Progression Threshold: **80% accuracy sustained**.
- **AI Recommendation Box**:
  - Calls `POST /api/ai/adaptive-therapy`.
  - Evaluates patient level scores against 80% threshold and checks plateau variance.
  - Outputs decision (`ADVANCE`, `CONTINUE`, or `REINFORCE`) with supporting evidence points and suggested activities.
- **Action Controls**:
  - **Approve Recommendation**: Calls `PUT /api/patients/:id` to promote patient `currentLevel`.

---

### 3.8 AI Case Allocation & Caseload Optimization (`AICaseAllocationView.tsx`)
- **Endpoint**: `POST /api/ai/case-allocation` or `GET /api/cases/:id/allocation-recommendations`.
- **Matching Algorithm**:
  $$\text{Match Score} = (0.40 \times \text{Skill}) + (0.25 \times \text{Workload}) + (0.20 \times \text{Availability}) + (0.15 \times \text{Supervisor Capacity})$$
- **UI Elements**: Ranked therapist candidate cards displaying match percentage, supervisor name, active caseload ratio (e.g., `4/8 Cases`), and matching rationale.
- **Confirm & Allocate Button**: Calls `POST /api/cases/:id/allocate`, setting therapist and supervisor.

---

### 3.9 Supervisor Center (`SupervisorCenter.tsx`)
Contains 3 operational tabs:
1. **AI Priority Queue Tab**:
   - Calls `GET /api/ai/supervisor-priority`.
   - Ranks active cases into **HIGH PRIORITY** (Score ≥ 60), **REVIEW SOON** (Score 30–59), or **NORMAL** (Score < 30).
   - Priority Triggers: Progress plateau/decline (+25), 10-session milestone (+20), session review overdue >14 days (+20), report pending (+15), goal stagnation (+15), low therapist confidence (+10), poor attendance <75% (+10).
2. **Plan Reviews Tab**:
   - Displays plans in `SUPERVISOR_REVIEW` status.
   - Shows automated **AI Quality Gate** checklist.
   - **Approve & Sign Off Button**: Calls `POST /api/cases/:id/approve` and `POST /api/therapy-plans/:id/approve`, updating status to `APPROVED` / `IN_THERAPY`.
3. **Student Competencies Tab**:
   - Displays student therapist competency radar charts across 5 domains (*Planning, Goal Setting, Documentation, Session Handling, Clinical Reasoning*).

---

### 3.10 Institutional Clinical Analytics (`AnalyticsView.tsx`)
- **Endpoint**: `GET /api/analytics/summary`.
- **Widgets**:
  - Active Cases, Average Patient Progress %, Sessions This Week, Supervisor Audit Rating.
  - **Language Distribution**: Percentage breakdown across Telugu, English, Kannada, Hindi, Malayalam, Tamil.
  - **Phoneme Accuracy Progress**: Baseline vs. Current accuracy gain per target sound.
  - **Case Priority Distribution**: High vs. Amber vs. Normal stable ratio.

---

## 4. Local Rule-Based AI Engine Technical Specification

All AI services are implemented in `server/src/services/ai.service.ts`, `allocationEngine.service.ts`, `priorityEngine.service.ts`, and `qualityGate.service.ts`.

### Key Technical Rules:
1. **Zero External API Dependencies**: No `@google/genai`, OpenAI, or Anthropic SDKs required.
2. **Deterministic Output**: Output is algorithmically generated directly from stored MongoDB documents.
3. **Human-in-the-Loop Scoping**: AI provides decision recommendations (`ADVANCE`, `CONTINUE`, `REINFORCE`, `HIGH PRIORITY`, `PLAN QUALITY %`). Authorized clinicians execute final state changes.

---

## 5. Troubleshooting & Verification Commands

To verify code integrity locally at any time:

```powershell
# 1. Run TypeScript Type Check
npm run lint

# 2. Run Production Build
npm run build

# 3. Check Git Working Tree
git status

# 4. Push Updates to GitHub (Triggers Vercel Auto-Deployment)
git add .
git commit -m "feat: update clinical manual documentation"
git push origin main
```
