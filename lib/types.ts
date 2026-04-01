import { Timestamp } from 'firebase/firestore';

export type UserRole = 'superadmin' | 'organizer' | 'evaluator' | 'pending';
export type CompetitionStatus = 'draft' | 'active' | 'scoring' | 'closed';
export type CompetitionType = 'hackathon' | 'designathon' | 'custom';
export type ScorecardStatus = 'draft' | 'submitted';
export type TeamStatus = 'registered' | 'submitted' | 'disqualified';
export type TeamMemberRole = 'leader' | 'member';

export interface Organisation {
  id: string;
  name: string;
  slug: string;
  contactEmail: string;
  createdAt: Timestamp;
  createdBy: string;
}

export interface Competition {
  id: string;
  orgId: string;
  name: string;
  type: CompetitionType;
  description: string;
  status: CompetitionStatus;
  teamMinSize: number;
  teamMaxSize: number;
  allowedDomains: string[];
  scoringConfig: {
    allowPartialSubmit: boolean;
    showLeaderboardTo: 'evaluators_and_organizers' | 'organizers_only';
    scoreVisibilityMode: 'live' | 'after_close';
    allowRescoring: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

export interface Criterion {
  id: string;
  competitionId: string;
  name: string;
  description: string;
  weight: number;
  maxScore: number;
  order: number;
  isRequired: boolean;
  category: string;
}

export interface TeamMember {
  name: string;
  email: string;
  studentId: string;
  university: string;
  role: TeamMemberRole;
}

export interface Team {
  id: string;
  competitionId: string;
  name: string;
  domain: string;
  projectTitle: string;
  submissionUrl: string;
  members: TeamMember[];
  importedAt: Timestamp;
  status: TeamStatus;
  notes: string;
}

export interface Evaluator {
  uid: string;
  competitionId: string;
  email: string;
  displayName: string;
  role: 'evaluator' | 'head_judge';
  assignedTeamIds: string[];
  isActive: boolean;
  addedAt: Timestamp;
  addedBy: string;
}

export interface CriterionScoreData {
  score: number;
  remarks: string;
  updatedAt: Timestamp;
}

export interface Scorecard {
  id: string;
  teamId: string;
  evaluatorId: string;
  competitionId: string;
  status: ScorecardStatus;
  scores: Record<string, CriterionScoreData>;
  totalRawScore: number;
  weightedScore: number;
  submittedAt: Timestamp | null;
  updatedAt: Timestamp;
}

export interface LeaderboardCache {
  teamId: string;
  teamName: string;
  domain: string;
  averageWeightedScore: number;
  rank: number;
  submittedScoreCount: number;
  totalEvaluators: number;
  lastUpdated: Timestamp;
}

export interface Invitation {
  id: string;
  email: string;
  role: UserRole;
  competitionId: string;
  orgId: string;
  createdBy: string;
  createdAt: Timestamp;
  expiresAt: Timestamp;
  used: boolean;
  usedAt: Timestamp | null;
}

export interface AuditLog {
  id: string;
  actorUid: string;
  actorEmail: string;
  action: string;
  resourceType: string;
  resourceId: string;
  competitionId: string;
  meta: Record<string, any>;
  timestamp: Timestamp;
}

export interface CustomClaims {
  role: UserRole;
  orgId: string;
  competitionIds: string[];
}

// API Request/Response types
export interface CreateCompetitionRequest {
  name: string;
  type: CompetitionType;
  description: string;
  teamMinSize: number;
  teamMaxSize: number;
  allowedDomains: string[];
  scoringConfig: Competition['scoringConfig'];
}

export interface ImportTeamsRequest {
  competitionId: string;
  teams: Omit<Team, 'id' | 'competitionId' | 'importedAt' | 'status'>[];
  format: 'csv' | 'json';
}

export interface ImportTeamsResponse {
  imported: number;
  errors: Array<{ index: number; reason: string }>;
}

export interface CreateInvitationRequest {
  email: string;
  role: UserRole;
  competitionId: string;
  orgId: string;
  assignedTeamIds?: string[];
}

export interface CreateInvitationResponse {
  inviteUrl: string;
  token: string;
  expiresAt: string;
}

export interface AcceptInvitationRequest {
  token: string;
  idToken: string;
}

export interface AcceptInvitationResponse {
  success: boolean;
  competitionId: string;
  role: UserRole;
}

export interface SubmitScoreRequest {
  teamId: string;
  competitionId: string;
  scores: Record<string, { score: number; remarks: string }>;
}

export interface SubmitScoreResponse {
  success: boolean;
  weightedScore: number;
  scorecardId: string;
}

export interface SessionResponse {
  success: boolean;
  role: UserRole;
  competitionIds: string[];
  uid: string;
}
