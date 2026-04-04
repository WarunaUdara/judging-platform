# CryptX Judging Platform - Feature Documentation

## Problem Statement

### Traditional Manual Evaluation Process
- **Paper-Based**: Judges use printed evaluation forms for each team
- **Manual Calculation**: Scores calculated by hand, prone to errors
- **Paper Waste**: 15 teams × 3 judges × 2 pages = 90 sheets per competition
- **Delayed Results**: Manual tallying takes hours after evaluation
- **No Real-Time Leaderboard**: Results not visible until manual entry complete
- **Storage**: Physical forms must be stored/archived

### Our Digital Solution
This platform digitizes the entire evaluation workflow, eliminating paper waste and automating score calculation with real-time leaderboard updates.

---

## Core Features

### 1. Digital Evaluation Workflow

#### Evaluator Experience (Simple & Fast)
```
1. Login → 2. Select Competition → 3. Select Team → 4. Enter Scores → 5. Submit
```

**Key Benefits:**
- **No paper forms**: All evaluation done on device (laptop/tablet)
- **Team list view**: See all teams in one place
- **One-click selection**: Pick team from list
- **Auto-calculation**: Total score computed automatically
- **Instant submission**: Results immediately available

#### How It Works
1. Judge logs in with email
2. Platform shows "Test Competition" (or active competition)
3. Judge sees list of 15 teams with project names
4. Judge selects a team (e.g., "Team Alpha - EduConnect")
5. Evaluation form shows 8 criteria with score inputs
6. Judge enters score for each criterion (0-max points)
7. Optional: Add comments per criterion
8. Platform shows running total (e.g., 87/100)
9. Judge clicks "Submit Evaluation"
10. Form auto-saves, judge can select next team

**Traditional vs. Digital:**
| Traditional | Digital Platform |
|-------------|------------------|
| Find paper form | Click team name |
| Write scores manually | Type or use number input |
| Calculate total by hand | Auto-calculated |
| Submit physical form | Click Submit button |
| Wait hours for results | Results instant |

---

### 2. Evaluation Criteria System

#### University Category (CryptX 2.0 Standard)
Based on `public/CryptX 2.0 Marking-university.pdf`:

| # | Criterion | Description | Max Points |
|---|-----------|-------------|------------|
| 1 | Problem Identification & Relevance | Real-world problem relevance, industry impact | 20 |
| 2 | Innovation & Uniqueness | Originality, creativity, novelty | 20 |
| 3 | Technical Implementation & System Design | Code architecture, scalability, execution quality | 10 |
| 4 | Cloud Usage | Use of cloud services (AWS, Azure, GCP) | 10 |
| 5 | Code Quality & Security | Clean code, error handling, security practices | 10 |
| 6 | Entrepreneurial Value | Business potential, market viability | 10 |
| 7 | Presentation Quality & Clarity | Demo quality, explanation clarity | 10 |
| 8 | Technical Viva (Q&A) | Ability to answer technical questions | 10 |
| **Total** | | | **100** |

#### Flexible Criteria System
- Organizers can customize criteria per competition
- Support for both University and School categories
- Weighted scoring (each criterion has weight + max score)
- Required vs. optional criteria
- Categories for grouping (Technical, Business, Communication)

---

### 3. Real-Time Leaderboard

#### Automated Ranking
- Scores aggregated in real-time as judges submit
- Teams ranked by average score (from all judges)
- Tie-breaking logic (if needed)
- Shows: Rank, Team Name, Project, Average Score, Evaluations Count

#### Example Leaderboard Display
```
Rank | Team | Project | Avg Score | Evaluations
-----|------|---------|-----------|-------------
  1  | Team Alpha | EduConnect | 89.33 | 3/3
  2  | Team Gamma | FinSmart | 87.50 | 3/3
  3  | Team Epsilon | CodeMentor | 85.00 | 3/3
 ...
 15  | Team Beta | HealthTrack | 68.25 | 3/3
```

#### Visibility Controls
- Organizers see all scores
- Judges can see live rankings (configurable)
- Teams see rankings after competition ends (configurable)

---

### 4. Multi-Role Access Control

| Role | Access |
|------|--------|
| **Superadmin** | Full platform access, create competitions, manage users |
| **Organizer** | Manage competitions, view all scores, export results |
| **Evaluator (Judge)** | Evaluate assigned teams, view leaderboard |
| **Team** | View own scores (after results released) |

---

### 5. Competition Management

#### Competition Lifecycle
1. **Draft**: Setup phase (add criteria, teams, judges)
2. **Scoring**: Active evaluation phase
3. **Completed**: Evaluation closed, results finalized

#### Setup Features
- Define competition metadata (name, description, dates)
- Add evaluation criteria (customize for your needs)
- Import teams (CSV, JSON, or manual entry)
- Invite evaluators via email
- Configure scoring rules (partial submit, rescoring, visibility)

---

### 6. Mock Data for Testing

#### Seeded Test Competition
The platform includes a test seed script that creates:
- ✅ 1 Test Competition (scoring phase active)
- ✅ 8 Evaluation Criteria (100 points total, matching CryptX 2.0)
- ✅ 3 Mock Evaluators (judges)
- ✅ 15 Mock Teams (diverse domains: EdTech, HealthTech, FinTech, AgriTech)
- ✅ 45 Mock Evaluations (15 teams × 3 judges, realistic scores)

#### Mock Teams
1. Team Alpha - EduConnect (EdTech)
2. Team Beta - HealthTrack (HealthTech)
3. Team Gamma - FinSmart (FinTech)
4. Team Delta - AgriPro (AgriTech)
5. Team Epsilon - CodeMentor (EdTech)
6. Team Zeta - MediBot (HealthTech)
7. Team Eta - PayEase (FinTech)
8. Team Theta - FarmLink (AgriTech)
9. Team Iota - ClassSync (EdTech)
10. Team Kappa - VitalCheck (HealthTech)
11. Team Lambda - CryptoSafe (FinTech)
12. Team Mu - WeatherWise (AgriTech)
13. Team Nu - QuizMaster (EdTech)
14. Team Xi - PharmTrack (HealthTech)
15. Team Omicron - BudgetPro (FinTech)

#### Mock Evaluators
1. Dr. Saman Perera (evaluator1@cryptx.lk)
2. Prof. Nimal Silva (evaluator2@cryptx.lk)
3. Eng. Kasun Fernando (evaluator3@cryptx.lk)

---

## Technical Stack

### Frontend
- **Next.js 16**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component primitives

### Backend
- **Firebase Admin SDK**: Server-side authentication & Firestore access
- **Firestore**: NoSQL database (competitions, teams, evaluations, scores)
- **Firebase Authentication**: Secure user authentication

### Security
- ✅ Environment variables for all secrets
- ✅ No hardcoded credentials
- ✅ Role-based access control (RBAC)
- ✅ Server-side validation
- ✅ Firestore security rules

---

## Cost Savings Analysis

### Traditional Paper-Based Approach
```
Per Competition:
- Teams: 15
- Judges: 3
- Evaluation form: 2 pages per team per judge
- Total pages: 15 × 3 × 2 = 90 pages

Annual (4 competitions):
- Total pages: 90 × 4 = 360 pages
- Printing cost: ~360 × LKR 5 = LKR 1,800
- Storage/archiving cost: ~LKR 500
- Time cost (manual entry): ~4 hours × LKR 500/hr = LKR 2,000

Total Annual Cost: ~LKR 4,300 + environmental impact
```

### Digital Platform Approach
```
- Printing cost: LKR 0
- Storage cost: LKR 0 (cloud-based)
- Manual entry time: 0 hours (auto-calculated)
- Paper waste: 0 sheets
- Environmental impact: Zero

Platform Cost:
- Firebase free tier: 50k reads, 20k writes per day (sufficient)
- Hosting: Free (Vercel/Firebase)

Total Annual Cost: ~LKR 0 (within free tiers)
```

**Savings: 100% reduction in paper/printing costs + 4 hours saved per competition**

---

## How to Use (Quick Start)

### Setup
```bash
# 1. Install dependencies
bun install

# 2. Configure environment
cp .env.local.example .env.local
# Edit .env.local with your Firebase credentials

# 3. Seed test data
bun run seed:test
```

### Run Development Server
```bash
bun run dev
# Open http://localhost:3000
```

### Login as Evaluator
```
Email: evaluator1@cryptx.lk (or evaluator2/evaluator3)
Password: (set via Firebase Auth Console)
```

### Test Evaluation Workflow
1. Login as evaluator
2. Navigate to "Test Competition"
3. View team list
4. Click on any team (e.g., "Team Alpha")
5. Enter scores for each criterion
6. Submit evaluation
7. Check leaderboard for real-time rankings

---

## Database Schema

### Collections
```
competitions/
  {competitionId}/
    - name, description, status, criteria, scoring config
    
    teams/
      {teamId}/
        - teamName, projectName, domain, members
    
    criteria/
      {criterionId}/
        - name, description, maxScore, weight, order

evaluations/
  {evaluationId}/
    - competitionId, teamId, evaluatorId, status, totalScore
    
    scores/
      {scoreId}/
        - criterionId, score, maxScore, comment

users/
  {userId}/
    - email, displayName, role, competitionIds
```

---

## Future Enhancements

### Planned Features
- [ ] CSV export of results
- [ ] PDF certificate generation
- [ ] Email notifications (evaluation reminders)
- [ ] Multi-language support (Sinhala, Tamil)
- [ ] Mobile app (React Native)
- [ ] Offline evaluation mode (PWA)
- [ ] Analytics dashboard (trends, statistics)
- [ ] Team self-registration portal
- [ ] QR code check-in for teams
- [ ] Live audience voting (bonus points)

### School Category Support
Currently focused on University category. School category criteria:
- Problem Understanding (25 points)
- Idea & Creativity (20 points)
- Solution Feasibility (15 points)
- Prototype/Demo (15 points)
- Implementation Skill (10 points)
- Presentation Skills (5 points)
- Q&A (5 points)
- Teamwork & Effort (5 points)

---

## Support & Contact

For issues or questions:
- GitHub Issues: [repository-url]
- Email: support@cryptx.lk
- Documentation: [docs-url]

---

## License

Proprietary - CryptX Judging Platform © 2026
