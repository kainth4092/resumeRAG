# ResuPilot AI — Manual QA & User Journey Testing Checklist

This document provides step-by-step test instructions and expected behavior for QA engineers, developers, and release managers validating ResuPilot AI.

---

## 📋 Test Matrix Overview

| Module | Primary Flows | Critical Verifications |
|---|---|---|
| **Auth & Security** | Registration, Login, Token Refresh, Logout, Password Change | HTTP-only cookies / Bearer headers, Token version invalidation, No user enumeration |
| **Resume Upload & Parsing** | PDF/DOCX Upload, Extraction, Scoring | 10MB limit enforcement, Extension whitelist, ATS score calculation |
| **Pipeline Orchestrator** | Full Pipeline Execution with Target Job Description | Polling timeout cap (3m), Exponential backoff, Partial failure isolation |
| **Resume Editor** | Realtime editing, Section reordering, PDF Export | Local storage persistence, A4 paging, Template switching |
| **Interview Preparation** | Question Bank browsing, Mock Q&A, Challenge Mode | Dynamic challenge counters, Timer sync, Blur warning dialog |
| **Career Roadmap** | Milestone generation, Task checkbox toggle, Role update | Milestone ID stability, Gap calculation, Progress % sync |
| **Job Discovery** | Recommended jobs, Bookmark, Filter by match score | Accurate semantic score, External application link |

---

## 1. Authentication & Security User Journey

### Flow 1.1: User Registration
- [ ] **Action**: Navigate to `/register`. Fill in Name, valid Email, and a strong password (min 8 chars, 1 digit, 1 special character). Click "Create Account".
- [ ] **Expected**: Toast shows "Registration successful". User is redirected to `/dashboard` or onboarding with user initials avatar rendered in Navbar.
- [ ] **Security Check**: Attempt to register the exact same email again.
  - **Expected**: Generic message returned, no disclosure of existing email details (preventing account enumeration).

### Flow 1.2: Password Change & Token Version Invalidation
- [ ] **Action**: From `/settings`, initiate a password change. Submit valid current password and new password.
- [ ] **Expected**: Success toast notification displayed.
- [ ] **Security Check**: Attempt to use old JWT tokens in another session.
  - **Expected**: Backend rejects requests with `401 Unauthorized` due to `token_version` bump.

---

## 2. Resume Upload & Parsing User Journey

### Flow 2.1: Valid File Upload
- [ ] **Action**: Go to `/dashboard` or `/my-resumes`. Drag and drop a valid `.pdf` or `.docx` resume (< 10MB).
- [ ] **Expected**: Progress spinner activates. Resume appears in list with correct title, parsed contact info, skills, and initial ATS match score.

### Flow 2.2: Invalid File Upload Guards
- [ ] **Action**: Attempt to upload a `.exe`, `.js`, or empty `0-byte` file.
- [ ] **Expected**: File is rejected immediately with clear error toast ("Unsupported file extension" or "File cannot be empty").

---

## 3. Pipeline Orchestration Journey

### Flow 3.1: Full Pipeline Run
- [ ] **Action**: Navigate to `/pipeline`. Select an active resume and paste a valid Job Description (> 50 chars). Click "Generate Tailored Resume & Prep".
- [ ] **Expected**:
  - Step 1: Context extraction completes.
  - Step 2: Tailored resume generated (anti-hallucination guard validates metrics and experience).
  - Step 3: Recommended jobs matched to target role.
  - Step 4: Tailored interview questions generated.
  - Step 5: Step-by-step career roadmap generated.
  - Polling UI updates dynamically with backoff interval.

### Flow 3.2: Polling Resilience
- [ ] **Action**: Simulate a prolonged background job.
- [ ] **Expected**: Polling automatically caps at 3 minutes with polite retry prompt rather than polling indefinitely.

---

## 4. Resume Editor & PDF Export Journey

### Flow 4.1: Live Editing & Layout
- [ ] **Action**: Navigate to `/editor`. Edit Personal Information, Summary, Experience bullets, and Skills.
- [ ] **Expected**: Live preview updates instantly. Changes persist to local state. Template switcher adjusts typography and borders smoothly.

### Flow 4.2: High-Fidelity PDF Export
- [ ] **Action**: Click "Export PDF".
- [ ] **Expected**: A cleanly formatted A4 PDF downloads without page break cutoffs across bullet points.

---

## 5. Interview Prep & Challenge Mode Journey

### Flow 5.1: Question Bank & Bookmarking
- [ ] **Action**: Navigate to `/interview`. Browse the questions bank. Filter by difficulty ("Hard") and category ("System Design").
- [ ] **Expected**: Filtered questions render. Clicking the bookmark star updates state instantly and syncs with backend.

### Flow 5.2: Timed Challenge Mode
- [ ] **Action**: Launch Challenge Mode. Select difficulty.
- [ ] **Expected**:
  - Modal opens with focus trap (Escape key closes confirmation).
  - Dynamic challenge counters display actual question count (no hardcoded "20").
  - Server-driven countdown timer runs accurately.
  - Switching browser tabs triggers anti-cheat warning dialog.
  - Submitting grades answers accurately based on keywords and technical depth.

---

## 6. Career Roadmap & Milestone Journey

### Flow 6.1: Roadmap Exploration & Task Completion
- [ ] **Action**: Navigate to `/roadmap`.
- [ ] **Expected**: Target role, skill gaps, and numbered milestones render.
- [ ] **Action**: Check off a milestone task.
- [ ] **Expected**: Task state toggles smoothly; overall roadmap completion percentage updates in real-time.

---

## 7. Accessibility (A11y) & UX Polish

- [ ] **Modal Focus Trap**: Open any modal (e.g. Delete Confirmation, Add Job, Feature Details). Press `Tab` repeatedly. Focus must cycle within the modal only.
- [ ] **Escape Key Close**: Pressing `Escape` on any modal closes it smoothly and restores focus to triggering element.
- [ ] **Toast Unification**: All notifications use `sonner` toasts. Zero native browser `alert()` or `confirm()` dialogs exist across the entire application.
- [ ] **Mobile Responsiveness**: Test on viewport width `375px` (iPhone). Dashboard cards, Editor toolbar, and Navigation menu collapse cleanly with no horizontal scroll overflow.
