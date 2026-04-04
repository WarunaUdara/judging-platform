# CryptX Judging Platform — Functional Requirements

**Document version:** 1.1 (Updated for current implementation)  
**Platform:** CryptX (https://cryptx.lk)  
**Stack:** Next.js 16 · Firebase Firestore · Firebase Realtime Database · Firebase Auth · Resend Email · Vercel  
**Plan:** Firebase Spark (free tier) — no Cloud Functions  
**Implementation Status:** 59% Complete (Backend Ready, Frontend Partial)  

---

## Table of Contents

1. [Overview](#1-overview)
2. [User Roles](#2-user-roles)
3. [Authentication & Access Control](#3-authentication--access-control)
4. [Organisation Management](#4-organisation-management)
5. [Competition Management](#5-competition-management)
6. [Evaluation Criteria Management](#6-evaluation-criteria-management)
7. [Team Management](#7-team-management)
8. [Evaluator Management](#8-evaluator-management)
9. [Evaluator Scoring Workflow](#9-evaluator-scoring-workflow)
10. [Leaderboard](#10-leaderboard)
11. [Organizer Admin Panel](#11-organizer-admin-panel)
12. [Export & Reporting](#12-export--reporting)
13. [Audit Logging](#13-audit-logging)
14. [Notifications & Invitations](#14-notifications--invitations)
15. [Non-Functional Requirements](#15-non-functional-requirements)
16. [Business Rules Summary](#16-business-rules-summary)

---

## 1. Overview

CryptX Judging Platform is a multi-competition evaluation system built for the CryptX hackathon series. It enables organizers to configure competitions with custom evaluation criteria and weighted scoring, onboard judges (evaluators) via invite links, manage participating teams, and surface a live leaderboard that updates in real time as judges submit scores.

The platform is built on the Firebase Spark (free) plan. All server-side logic runs in Next.js API routes on Vercel, replacing Cloud Functions entirely. The live leaderboard is powered by Firebase Realtime Database.

### Key Actors
- **Super Admin (Organizer)** — owns the platform, creates and configures competitions
- **Evaluator (Judge)** — receives an invite link, logs in, scores assigned teams
- **System** — Next.js API routes that handle scoring, leaderboard updates, and auth

---

## 2. User Roles

| Role | Description | Access Level |
|---|---|---|
| `superadmin` | Platform owner / CryptX organizer | Full access to all competitions and admin functions |
| `organizer` | Competition-level admin (future extension) | Access scoped to assigned competitions |
| `evaluator` | Judge assigned to a specific competition | Access to scoring panel and leaderboard for their competition only |

Roles are stored as Firebase Auth custom claims (`role`, `orgId`, `competitionIds[]`). Claims are set by Next.js API routes using the Firebase Admin SDK.

---

## 3. Authentication & Access Control

### FR-AUTH-01 — Login
The platform shall support two login methods: Google OAuth and email/password via Firebase Authentication.

### FR-AUTH-02 — Role-Based Redirect
After login, the system shall redirect the user to the correct dashboard based on their role:
- `superadmin` or `organizer` → `/admin`
- `evaluator` → `/judge/dashboard`
- Unauthenticated users → `/login`

### FR-AUTH-03 — Session Management
The system shall exchange the Firebase ID token for a secure HTTP-only session cookie on login. All subsequent requests to protected routes shall be verified using this cookie server-side in Next.js middleware.

### FR-AUTH-04 — Route Protection
All routes under `/admin/*` shall require `role === "superadmin"` or `"organizer"`. All routes under `/judge/*` shall require `role === "evaluator"`. Unauthorized access attempts shall redirect to `/login`.

### FR-AUTH-05 — Custom Claims
Custom claims shall include `role`, `orgId`, and `competitionIds[]`. An evaluator may hold access to multiple competitions simultaneously. Claims are set and updated via the `POST /api/auth/set-claims` route using the Admin SDK.

### FR-AUTH-06 — Evaluator Access Scope
An evaluator shall only be able to access data belonging to competitions listed in their `competitionIds[]` claim. This is enforced both by Firestore Security Rules and by server-side validation in API routes.

---

## 4. Organisation Management

### FR-ORG-01 — Organisation Record
The platform shall maintain a single organisation record for CryptX containing: name, slug, logo URL, and contact email. This record is the parent of all competitions.

### FR-ORG-02 — Organisation Visibility
Organisation details shall be visible only to users whose `orgId` claim matches the organisation ID.

---

## 5. Competition Management

### FR-COMP-01 — Create Competition
A super admin shall be able to create a competition with the following configuration fields:

| Field | Type | Description |
|---|---|---|
| Name | string | Display name, e.g. "CryptX 2.0 — Hackathon" |
| Type | enum | `hackathon`, `designathon`, `custom` |
| Description | string | Full competition description |
| Team min size | integer | Minimum members per team |
| Team max size | integer | Maximum members per team |
| Allowed domains | string[] | Valid industry domains teams may select |
| Status | enum | `draft`, `active`, `scoring`, `closed` |
| Scoring config | object | See FR-COMP-03 |

### FR-COMP-02 — Competition Status Lifecycle
Competitions shall follow a strict one-way status lifecycle:

```
draft → active → scoring → closed
```

- `draft` — competition is being configured; no evaluator access, no scoring
- `active` — teams registered, evaluators invited; scoring not yet open
- `scoring` — evaluators can submit scores; leaderboard is live
- `closed` — scoring locked; leaderboard frozen; exports available

The status transition shall be performed by the organizer from the competition overview tab.

### FR-COMP-03 — Scoring Configuration
Each competition shall have a scoring configuration object with the following flags:

| Flag | Type | Description |
|---|---|---|
| `allowPartialSubmit` | boolean | Whether evaluators can save draft scores before final submission |
| `showLeaderboardTo` | enum | `evaluators_and_organizers` or `organizers_only` |
| `scoreVisibilityMode` | enum | `live` (updates in real time) or `after_close` (revealed only when competition closes) |
| `allowRescoring` | boolean | Whether evaluators may edit a score after submission |

### FR-COMP-04 — Multiple Competitions
The platform shall support multiple competitions simultaneously, each independently configured with their own criteria, teams, evaluators, and leaderboard.

### FR-COMP-05 — Competition Templates
When creating a competition of type `hackathon`, the organizer shall be offered the option to load the CryptX default evaluation criteria template (see FR-CRIT-05).

---

## 6. Evaluation Criteria Management

### FR-CRIT-01 — Define Criteria
An organizer shall be able to define evaluation criteria for each competition. Each criterion shall have the following fields:

| Field | Type | Description |
|---|---|---|
| Name | string | e.g. "Problem Identification & Relevance" |
| Description | string | Full rubric text shown to evaluators during scoring |
| Category | string | Grouping label: e.g. "Technical Core", "Advanced", "Communication" |
| Weight | integer | Percentage weight (all criteria weights must sum to 100) |
| Max score | integer | Maximum raw score an evaluator can assign (e.g. 10) |
| Order | integer | Display order in the scoring form |
| Is required | boolean | Whether the evaluator must score this criterion before submitting |

### FR-CRIT-02 — Weight Validation
The system shall display a live weight total indicator on the criteria management page. The organizer shall not be able to save criteria changes if the total weight does not equal exactly 100%. A warning badge shall be shown when the sum is off.

### FR-CRIT-03 — Criteria Visibility to Evaluators
All criteria including their name, full description (rubric), category, weight, and max score shall be visible to evaluators on the scoring page. Evaluators shall see the criteria in the configured display order.

### FR-CRIT-04 — Criteria CRUD
Organizers shall be able to add, edit, delete, and reorder criteria at any time while the competition is in `draft` or `active` status. Criteria changes shall be locked once the competition moves to `scoring` status.

### FR-CRIT-05 — CryptX Default Template
The organizer shall be able to load a pre-built CryptX Hackathon criteria template that pre-fills all 8 criteria with the following configuration:

| Criteria | Weight | Max Score | Category |
|---|---|---|---|
| Problem Identification & Relevance | 20% | 10 | Technical Core |
| Innovation & Uniqueness | 20% | 10 | Technical Core |
| Technical Implementation & System Design | 10% | 10 | Technical Core |
| Cloud Usage | 10% | 10 | Advanced |
| Code Quality & Security | 10% | 10 | Advanced |
| Entrepreneurial Value | 10% | 10 | Advanced |
| Presentation Quality & Clarity | 10% | 10 | Communication |
| Technical Viva (Q&A) | 10% | 10 | Communication |

---

## 7. Team Management

### FR-TEAM-01 — Team Data Structure
Each team in a competition shall have the following data:

| Field | Description |
|---|---|
| Team name | Display name of the team |
| Domain | Selected industry domain from the competition's allowed domains |
| Project title | Name of the team's project |
| Submission URL | GitHub or deployed project URL |
| Members | Array of member objects (name, email, student ID, university, role) |
| Status | `registered`, `submitted`, or `disqualified` |
| Notes | Internal organizer notes (not visible to evaluators) |

### FR-TEAM-02 — Member Validation
The number of members per team must be between the competition's `teamMinSize` and `teamMaxSize` inclusive. This constraint is enforced on all input methods (manual form, CSV import, JSON import).

### FR-TEAM-03 — Manual Team Entry
Organizers shall be able to add a team manually through a form with dynamic member rows. The form shall enforce the min/max member count in real time, preventing submission if the count is out of range.

### FR-TEAM-04 — CSV Bulk Import
Organizers shall be able to upload a CSV file to bulk-import teams. The system shall:
- Parse the file using papaparse
- Expect the following column format: `team_name, domain, project_title, submission_url, member1_name, member1_email, member1_studentId, member1_university, member1_role, member2_name, ...` (up to `teamMaxSize` members)
- Display a preview table of parsed data before confirming the import
- Validate every row against business rules (member count, required fields, no duplicate emails within a team)
- Write all valid rows as separate team documents in a single Firestore batch
- Return a results summary: total imported, list of failed rows with row number and reason

### FR-TEAM-05 — JSON Bulk Import
Organizers shall be able to paste a raw JSON array following the team schema as an alternative import method. The system shall validate the JSON structure with a zod schema, show a preview, and batch-write valid records. Error messages shall be schema-specific and human-readable.

### FR-TEAM-06 — Team Edit & Delete
Organizers shall be able to edit any team's details or delete a team. Deletion shall require a confirmation dialog. Deleting a team shall also remove all associated scorecards for that team.

### FR-TEAM-07 — Team Status Management
Organizers shall be able to change a team's status to `disqualified`. Disqualified teams shall be excluded from the leaderboard and evaluators shall not be able to submit scores for them.

---

## 8. Evaluator Management

### FR-EVAL-01 — Invite Evaluator
Organizers shall be able to invite an evaluator by entering their email address and role (`evaluator` or `head_judge`). Optionally, the organizer may assign the evaluator to specific team IDs. If no teams are assigned, the evaluator can score all non-disqualified teams in the competition.

### FR-EVAL-02 — Invite Link Generation
On submission of the invite form, the system shall generate a unique UUID invite token, create an invitation document in Firestore with a 48-hour expiry, and return the full invite URL to the organizer (e.g. `https://app.cryptx.lk/invite/{token}`). The organizer shall be able to copy this link to share with the evaluator manually.

### FR-EVAL-03 — Invite Acceptance Flow
When an evaluator visits the invite URL:
1. They are prompted to sign in (Google OAuth or email/password)
2. After authentication, the system validates the invite token (not used, not expired)
3. The system merges the new `competitionId` into the evaluator's existing `competitionIds[]` claim
4. The system creates the evaluator document in `competitions/{id}/evaluators`
5. The invitation is marked as used with a `usedAt` timestamp
6. The evaluator is redirected to `/judge/dashboard`

### FR-EVAL-04 — Invite Expiry
Invite tokens shall expire 48 hours after creation. Expired tokens shall display an error page with instructions to contact the organizer for a new link. Expired invitations can be regenerated by the organizer.

### FR-EVAL-05 — Evaluator Deactivation
Organizers shall be able to deactivate an evaluator's access via a toggle on the evaluators table. Deactivated evaluators shall not be able to log in or submit scores, even if they hold a valid session cookie.

### FR-EVAL-06 — Team Assignment
Each evaluator has an `assignedTeamIds` array. If this array is empty, the evaluator sees and can score all teams. If it contains specific team IDs, the evaluator's dashboard and scoring access is restricted to those teams only. This is enforced both in the UI and in the score submission API route.

---

## 9. Evaluator Scoring Workflow

### FR-SCORE-01 — Evaluator Dashboard
After login, an evaluator shall see their personal judging dashboard showing:
- A progress summary card: "X of Y teams scored"
- A grid of team cards, one per assigned (or all) team
- Each card shows: team name, domain, project title, submission URL (external link), and a scoring status badge

Scoring status badges:
| Badge | Meaning |
|---|---|
| Not started | No scorecard exists for this evaluator + team pair |
| Draft saved | A scorecard exists with `status: "draft"` |
| Submitted | A scorecard exists with `status: "submitted"` |

### FR-SCORE-02 — Team Selection
The evaluator shall click on a team card to open the scoring page for that team. The scoring page shall display the team's full details at the top: name, domain, project title, clickable submission URL, and a list of all team members.

### FR-SCORE-03 — Criteria Display
The scoring page shall display all evaluation criteria for the competition in configured order. For each criterion the evaluator shall see:
- Criterion name (bold)
- Full rubric description (collapsible section, open by default)
- Category label (badge)
- Weight label (e.g. "Weight: 20%")
- Score input: a number input field and a range slider, both ranging from 0 to `maxScore`, step 1, synchronized with each other
- A remarks / comments textarea

### FR-SCORE-04 — Live Score Preview
While the evaluator is filling in scores, a sticky preview panel shall update in real time showing:
- Per-criterion weighted contribution: `(score / maxScore) × weight`
- A running total weighted score out of 100
- A visual indicator (e.g. color-coded progress bar) showing how close to 100 the score is

This preview is computed entirely client-side and does not make API calls.

### FR-SCORE-05 — Save Draft
If the competition has `allowPartialSubmit === true`, the evaluator shall see a "Save Draft" button. Clicking it shall call `POST /api/scores/save`, save the scorecard with `status: "draft"`, and show a success toast. The evaluator may leave and return; their draft scores will be pre-populated on return.

### FR-SCORE-06 — Submit Score
The evaluator shall see a "Submit Score" button. Clicking it shall show a confirmation modal. The modal text shall vary based on `allowRescoring`:
- If `allowRescoring === false`: "Once submitted, your score cannot be changed."
- If `allowRescoring === true`: "You can edit this score until the competition is closed."

On confirmation, the system shall call `POST /api/scores/submit`.

### FR-SCORE-07 — Score Submission API
The `POST /api/scores/submit` route shall perform the following steps in order:
1. Verify the evaluator's session cookie and competition claim
2. Check competition `status === "scoring"`
3. Check the evaluator is active and authorized for this team
4. Validate all required criteria have scores and all values are within 0–`maxScore`
5. Compute `weightedScore = Σ (score / maxScore) × weight` for all criteria
6. Write the scorecard document to Firestore with `status: "submitted"`
7. Trigger leaderboard recalculation (see FR-LB-02)
8. Write an audit log entry
9. Return `{ success: true, weightedScore }`

### FR-SCORE-08 — Read-Only After Submission
If `allowRescoring === false` and the scorecard is already `submitted`, the scoring page shall render in fully read-only mode: all inputs disabled, both action buttons hidden, scores displayed as static values. A banner shall notify the evaluator that the score has been submitted.

### FR-SCORE-09 — Rescoring
If `allowRescoring === true`, the evaluator may return to a submitted scorecard, modify any scores, and resubmit. Resubmission overwrites the existing scorecard and triggers a full leaderboard recalculation.

### FR-SCORE-10 — Score Isolation
An evaluator shall not be able to view, read, or in any way access another evaluator's scores. Firestore Security Rules shall enforce that each evaluator can only read scorecards where `evaluatorId === request.auth.uid`.

---

## 10. Leaderboard

### FR-LB-01 — Leaderboard Data
The leaderboard shall show one entry per team with the following columns:

| Column | Description |
|---|---|
| Rank | Position by average weighted score (1 = highest) |
| Team name | Team display name |
| Domain | Team's selected industry domain |
| Average weighted score | Mean of all submitted evaluators' weighted scores |
| Scores submitted | Count of submitted scorecards / total active evaluators |

### FR-LB-02 — Leaderboard Calculation
The leaderboard shall be recalculated inside the `POST /api/scores/submit` API route after every scorecard submission. The calculation steps are:

1. Fetch all submitted scorecards for the affected `teamId` in this competition
2. Compute `weightedScore` for each: `Σ (score / maxScore) × weight`
3. Compute `averageWeightedScore = mean(all submitted weightedScores for this team)`
4. Fetch `averageWeightedScore` for all other teams in the competition from their `leaderboard_cache` documents
5. Sort all teams by `averageWeightedScore` descending and assign ranks (rank 1 = highest score)
6. Batch-write updated `leaderboard_cache` documents to Firestore
7. Write the full `/leaderboards/{competitionId}/entries` object to Firebase Realtime Database

### FR-LB-03 — Real-Time Updates
The leaderboard page shall subscribe to Firebase Realtime Database at `/leaderboards/{competitionId}/` using `onValue()`. Every time the database node is updated (triggered by a score submission), the leaderboard table shall re-render automatically with the new rankings — without a page refresh.

### FR-LB-04 — Leaderboard Visibility
Leaderboard visibility to evaluators is controlled by the competition's `showLeaderboardTo` setting:
- `evaluators_and_organizers` — evaluators see the `/judge/leaderboard` page with the live table
- `organizers_only` — the leaderboard route is hidden from evaluators; only organizers see it

Organizers always see the leaderboard regardless of this setting.

### FR-LB-05 — Score Visibility Mode
The `scoreVisibilityMode` setting controls when scores appear on the leaderboard:
- `live` — scores appear as soon as a scorecard is submitted
- `after_close` — the leaderboard displays dashes until the competition moves to `closed` status, at which point all scores are revealed simultaneously

### FR-LB-06 — Freeze Display
Organizers shall have a "Freeze Display" toggle on the leaderboard tab. When enabled, the visible table stops re-sorting on new updates (data continues updating in the background). This is intended for use during awards ceremonies. The freeze state is local to the browser session and is not persisted.

### FR-LB-07 — Tied Scores
If two or more teams have identical `averageWeightedScore` values, they shall share the same rank. The next rank shall be skipped (e.g. two teams at rank 1 means the next team is rank 3).

### FR-LB-08 — Incomplete Scoring
Teams for which no evaluator has submitted a score shall appear at the bottom of the leaderboard with an `averageWeightedScore` of `—` and no rank assigned.

---

## 11. Organizer Admin Panel

### FR-ADMIN-01 — Overview Dashboard
The admin dashboard shall display summary cards for the entire organisation:
- Total competitions
- Total teams across all competitions
- Total active evaluators
- Total submitted scorecards

### FR-ADMIN-02 — Competition List
The competitions page shall display all competitions in a table with: name, type, status badge, team count, evaluator count, and action buttons (view, edit). A "Create Competition" button shall navigate to the creation form.

### FR-ADMIN-03 — Competition Detail — Tabbed Layout
Each competition detail page shall have the following tabs: Overview, Criteria, Teams, Evaluators, Scorecards, Leaderboard, Audit Log.

### FR-ADMIN-04 — Scorecards Matrix View
The Scorecards tab shall display a matrix table where rows are teams and columns are evaluators. Each cell shall show a status icon:
- Empty circle — not started
- Half-filled circle — draft saved
- Filled circle — submitted

Clicking a cell shall open a side drawer showing the full scorecard (all criteria scores and remarks) in read-only mode for the organizer.

### FR-ADMIN-05 — Evaluator Progress Tracking
The organizer shall be able to see at a glance which evaluators have submitted scores for which teams, and which are still pending.

---

## 12. Export & Reporting

### FR-EXP-01 — Score Export (CSV)
Organizers shall be able to export all submitted scores for a competition as a CSV file. The export shall include:
- Team name
- Team domain
- Evaluator name
- One column per criterion (raw score and remarks)
- Total weighted score
- Submission timestamp

The export is available via `GET /api/competitions/[id]/export/scores` and downloads as a `.csv` file.

### FR-EXP-02 — Leaderboard Export (CSV)
Organizers shall be able to download the current leaderboard as a CSV file directly from the leaderboard tab. The export includes rank, team name, domain, average weighted score, and scores submitted count.

### FR-EXP-03 — Export Access Control
Both export endpoints are protected. Only `superadmin` and `organizer` role users may access them. Evaluators do not have access to export functionality.

---

## 13. Audit Logging

### FR-AUDIT-01 — Audit Events
The system shall write an audit log entry for every significant mutation. Events to log include:

| Action | Trigger |
|---|---|
| `score.submit` | Evaluator submits a scorecard |
| `score.save_draft` | Evaluator saves a draft scorecard |
| `team.import` | Organizer imports teams via CSV or JSON |
| `team.create` | Organizer manually creates a team |
| `team.delete` | Organizer deletes a team |
| `criteria.update` | Organizer saves criteria changes |
| `competition.status_change` | Organizer changes competition status |
| `invite.create` | Organizer generates an invite link |
| `invite.accept` | Evaluator accepts an invite |
| `evaluator.deactivate` | Organizer deactivates an evaluator |

### FR-AUDIT-02 — Audit Log Fields
Each audit log entry shall capture: actor UID, actor email, action type, resource type, resource ID, competition ID, timestamp, and a `meta` object with relevant before/after context (e.g. old and new status for a status change).

### FR-AUDIT-03 — Audit Log Visibility
The Audit Log tab on the competition detail page shall display a paginated table of all events for that competition. Only super admins can view audit logs. Logs are read-only and cannot be deleted.

### FR-AUDIT-04 — Audit Log Writes
All audit log writes are performed server-side in API routes using the Firebase Admin SDK. Clients cannot write directly to the `audit_logs` collection (enforced by Firestore Security Rules: `allow write: if false`).

---

## 14. Notifications & Invitations

### FR-NOTIF-01 — Automated Invite Email
The platform shall send automated invite emails using Resend API when an organizer invites an evaluator. The email shall include:
- Evaluator's name
- Competition name and details
- Unique invite link with token
- Link expiry notice (48 hours)
- CryptX branding

If email delivery fails, the system shall display the invite link in the UI with a "Copy Link" button as fallback. The organizer can manually share the link via WhatsApp, Slack, etc.

### FR-NOTIF-02 — Toast Notifications
All successful mutations (score submitted, team imported, invite created, criteria saved) shall display a success toast notification. All failed mutations shall display an error toast with a human-readable error message.

### FR-NOTIF-03 — Confirmation Dialogs
All destructive actions shall require a confirmation dialog before proceeding. Destructive actions include: deleting a team, deactivating an evaluator, submitting a score (if `allowRescoring === false`), and changing competition status to `closed`.

---

## 15. Non-Functional Requirements

### NFR-01 — Real-Time Leaderboard Latency
After an evaluator submits a score, the leaderboard visible to all subscribed users shall reflect the updated ranking within 3 seconds under normal network conditions.

### NFR-02 — Mobile Responsiveness
The evaluator scoring page (`/judge/score/[teamId]`) shall be fully usable on mobile devices and tablets. Organizers and evaluators may be working in a venue on phones. All form inputs, sliders, and buttons must be touch-friendly with adequate tap target sizes.

### NFR-03 — Firebase Free Tier Limits
The platform shall operate within Firebase Spark plan limits:
- Firestore: 50,000 reads / 20,000 writes / 1 GB storage per day
- Realtime Database: 1 GB storage / 10 GB transfer per month
- Auth: 10,000 authentications per month

For a typical CryptX hackathon (≤50 teams, ≤10 evaluators, 8 criteria), estimated daily Firestore usage is well within limits (~2,000 writes on a busy scoring day).

### NFR-04 — Security
- All sensitive writes go through Next.js API routes using the Firebase Admin SDK; clients cannot write directly to `scorecards`, `evaluators`, `leaderboard_cache`, `invitations`, or `audit_logs`
- Session cookies are `HttpOnly`, `Secure`, and `SameSite=Strict`
- Invite tokens are UUIDs and expire after 48 hours
- Evaluators cannot read other evaluators' scorecards (enforced by Firestore rules)

### NFR-05 — Form Validation
All forms shall use react-hook-form with zod schemas. Validation errors shall appear inline below the relevant field, not as alerts. The same zod schemas used client-side shall be reused in API routes for server-side validation.

### NFR-06 — Loading States
All data-heavy pages shall display skeleton loading states while data is being fetched. No page shall render in a partially-loaded state without a visual loading indicator.

### NFR-07 — Extensibility
The competition model is designed to support future competition types beyond hackathon and designathon. Adding a new type requires only creating a new competition record with the appropriate `teamMinSize`, `teamMaxSize`, and criteria — no code changes are required.

---

## 16. Business Rules Summary

| Rule | Description |
|---|---|
| BR-01 | Criteria weights must sum to exactly 100% before a competition can move to `scoring` status |
| BR-02 | Team member count must be ≥ `teamMinSize` and ≤ `teamMaxSize` for the competition |
| BR-03 | Scores can only be submitted when the competition `status === "scoring"` |
| BR-04 | A disqualified team cannot receive new score submissions and is excluded from the leaderboard |
| BR-05 | An evaluator can only score teams in their `assignedTeamIds` list (or all teams if the list is empty) |
| BR-06 | Draft saves are only permitted when `allowPartialSubmit === true` |
| BR-07 | Score edits after submission are only permitted when `allowRescoring === true` |
| BR-08 | Invite tokens expire after 48 hours and cannot be reused |
| BR-09 | Deactivated evaluators cannot log in or submit scores regardless of session state |
| BR-10 | Criteria configuration is locked once the competition moves to `scoring` status |
| BR-11 | Status transitions are one-way: `draft → active → scoring → closed` |
| BR-12 | The leaderboard recalculation runs synchronously inside the score submission API route |
| BR-13 | Audit logs are immutable; no user role may delete or modify them |
| BR-14 | All score export and audit log access is restricted to `superadmin` and `organizer` roles |
