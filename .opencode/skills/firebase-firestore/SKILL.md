---
name: firebase-firestore
description: Firebase Firestore security rules, queries, and data patterns for CryptX Judging Platform
license: MIT
compatibility: opencode
metadata:
  audience: backend-developers
  firebase: firestore
---

## What I do

Provide Firebase Firestore guidance specific to CryptX Judging Platform.

## Firestore Structure

```
users/{uid}           - User profiles with role, competitionIds, orgId
organisations/{orgId} - Organisation data
competitions/{cid}/
  ├── criteria/       - Scoring criteria
  ├── teams/          - Team submissions
  ├── evaluators/     - Assigned evaluators
  ├── scorecards/     - Evaluation scores
  ├── leaderboard_cache/ - Cached rankings
  └── audit_logs/     - Activity logs
invitations/{id}     - Invite tokens
```

## Security Rules Pattern

The project uses dual verification - checks both custom claims AND Firestore document:

```javascript
function hasRole(role) { 
  return request.auth.token.role == role || 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == role;
}
```

## Role-Based Access

- `superadmin` - Full access to all competitions and orgs
- `organizer` - Access to specific competitions (via competitionIds)
- `evaluator` - Score teams in assigned competitions
- `pending` - New users, no access

## Common Queries

```typescript
// Get competitions for user
const getUserCompetitions = async (uid: string) => {
  const userDoc = await db.collection('users').doc(uid).get();
  const role = userDoc.data()?.role;
  if (role === 'superadmin') {
    return db.collection('competitions').get();
  }
  const compIds = userDoc.data()?.competitionIds || [];
  return db.collection('competitions').where('id', 'in', compIds).get();
};

// Get teams for competition
const getTeams = async (competitionId: string) => {
  return db.collection(`competitions/${competitionId}/teams`).get();
};

// Get scorecards for team
const getTeamScores = async (competitionId: string, teamId: string) => {
  return db.collection(`competitions/${competitionId}/scorecards`)
    .where('teamId', '==', teamId).get();
};
```

## Best Practices

- Always use composite indexes for complex queries
- Cache leaderboard data in leaderboard_cache collection
- Use batch writes for bulk operations
- Implement soft delete for teams (status field)