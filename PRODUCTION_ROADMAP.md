# CryptX Judging Platform - Production Roadmap

**Current Status:** 59% Complete (20/34 tasks)
**Target:** Production-Ready Deployment

---

## Phase 1: Critical Fixes & Security (HIGH PRIORITY)

### 1.1 Security Fixes
- [ ] Fix middleware to verify user roles, not just cookie presence
- [ ] Remove dual role check (custom claims vs Firestore doc) - choose one source
- [ ] Add rate limiting to API routes
- [ ] Validate all environment variables at startup

### 1.2 Missing Core APIs
- [ ] `GET /api/competitions/[id]/export/scores` - Export scores as CSV
- [ ] `GET /api/competitions/[id]/export/leaderboard` - Export leaderboard as CSV
- [ ] `GET /api/competitions/[id]/audit-logs` - Fetch audit logs
- [ ] `PATCH /api/evaluators/[id]` - Deactivate evaluator
- [ ] `POST /api/teams` - Create single team
- [ ] `PATCH /api/teams/[id]` - Edit team
- [ ] `DELETE /api/teams/[id]` - Delete team
- [ ] `PATCH /api/teams/[id]/status` - Update team status (disqualify)

### 1.3 Email Integration
- [ ] Create `/api/email/send-invite` route using Resend
- [ ] Add email template for evaluator invite with token link
- [ ] Update invite creation flow to trigger email send
- [ ] Handle Resend API errors gracefully

---

## Phase 2: Complete Admin Panel (HIGH PRIORITY)

### 2.1 Missing Admin Tabs
- [ ] Build `/admin/competitions/[id]` - Evaluators tab with list, invite, deactivate
- [ ] Build `/admin/competitions/[id]` - Scorecards Matrix view (evaluators × teams grid)
- [ ] Build `/admin/competitions/[id]` - Audit Log tab with paginated table
- [ ] Add "View All Competitions" dedicated page at `/admin/competitions`

### 2.2 Team Management
- [ ] Add manual team entry form
- [ ] Add edit team dialog
- [ ] Add delete team with confirmation
- [ ] Add team status dropdown (registered/submitted/disqualified)
- [ ] Filter disqualified teams from evaluator views

### 2.3 Organisation Management
- [ ] Create `/admin/organisation` page
- [ ] Add org details form (name, slug, logo, contact email)
- [ ] Show org info in admin header

### 2.4 UI Improvements
- [ ] Add "Load CryptX Template" button on criteria tab
- [ ] Add weight sum indicator badge on criteria page
- [ ] Add competition status change confirmation dialogs
- [ ] Add loading skeletons for all data tables

---

## Phase 3: Evaluator Experience Polish (MEDIUM PRIORITY)

### 3.1 Judge Pages
- [ ] Create `/judge/teams` grid view (alternative to dashboard cards)
- [ ] Add read-only mode for submitted scores (if rescoring disabled)
- [ ] Add rescoring flow validation
- [ ] Show "Score locked" banner when appropriate

### 3.2 Leaderboard Enhancements
- [ ] Implement score visibility mode (live vs after_close)
- [ ] Add "Freeze Display" toggle for organizers
- [ ] Show dashes for teams with no scores
- [ ] Add export button for organizers

---

## Phase 4: Testing & Error Handling (MEDIUM PRIORITY)

### 4.1 Error Boundaries
- [ ] Add root error boundary
- [ ] Add page-level error boundaries
- [ ] Add API error boundary middleware
- [ ] Create error fallback UI components

### 4.2 E2E Tests
- [ ] Superadmin creates competition
- [ ] Superadmin imports teams
- [ ] Superadmin invites evaluator
- [ ] Evaluator accepts invite
- [ ] Evaluator submits score
- [ ] Leaderboard updates in real-time
- [ ] Superadmin exports scores

### 4.3 Validation
- [ ] Add zod schemas for all API route inputs
- [ ] Reuse schemas in client-side forms
- [ ] Add input sanitization for XSS prevention
- [ ] Test all form edge cases

---

## Phase 5: Deployment Preparation (HIGH PRIORITY)

### 5.1 Configuration
- [ ] Create production Firebase project
- [ ] Deploy Firestore security rules
- [ ] Deploy Firestore indexes
- [ ] Deploy Realtime Database rules
- [ ] Add Firebase service account to Vercel secrets
- [ ] Configure all environment variables in Vercel

### 5.2 Documentation
- [ ] Update README with deployment instructions
- [ ] Create admin user guide
- [ ] Create evaluator user guide
- [ ] Document API endpoints (optional)

### 5.3 Pre-Launch Checklist
- [ ] Test with production Firebase project
- [ ] Run seed script to create default competition
- [ ] Create first superadmin account
- [ ] Verify email sending works
- [ ] Test invite acceptance flow end-to-end
- [ ] Test scoring and leaderboard updates
- [ ] Test CSV exports
- [ ] Check Firebase quota usage
- [ ] Enable Firebase Analytics (optional)
- [ ] Set up error monitoring (Sentry/LogRocket)

---

## Phase 6: Post-Launch Enhancements (LOW PRIORITY)

### 6.1 Nice-to-Haves
- [ ] Add dark mode toggle
- [ ] Add profile page for users
- [ ] Add email notifications for score submissions
- [ ] Add competition cloning feature
- [ ] Add bulk evaluator import
- [ ] Add PDF export for final reports
- [ ] Add charts/graphs for score distribution
- [ ] Add evaluator performance analytics

### 6.2 Performance Optimizations
- [ ] Add Redis caching for leaderboard (if needed)
- [ ] Optimize Firestore queries with pagination
- [ ] Add image optimization for team logos
- [ ] Implement code splitting for admin panel

---

## Time Estimates

| Phase | Estimated Time | Priority |
|-------|----------------|----------|
| Phase 1: Critical Fixes & Security | 8-12 hours | HIGH |
| Phase 2: Complete Admin Panel | 16-20 hours | HIGH |
| Phase 3: Evaluator Polish | 6-8 hours | MEDIUM |
| Phase 4: Testing & Error Handling | 8-10 hours | MEDIUM |
| Phase 5: Deployment Preparation | 4-6 hours | HIGH |
| Phase 6: Post-Launch Enhancements | 16-20 hours | LOW |
| **TOTAL TO MVP** | **42-56 hours** | - |

---

## Current Sprint Focus (Next 6-8 hours)

1. Fix middleware role verification
2. Implement score export API
3. Implement leaderboard export API
4. Integrate Resend for invite emails
5. Build Evaluators tab in admin
6. Build Scorecards Matrix view

---

## Definition of "Production Ready"

- All Phase 1 tasks complete
- All Phase 2 tasks complete
- Phase 5 deployment checklist passed
- At least 3 E2E test flows working
- Email invites working
- Exports working
- No critical security issues

**Target Date:** Based on 40-50 hours of work
