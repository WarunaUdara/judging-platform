type Timestamp = string;

export type UserRole = "superadmin" | "organizer" | "evaluator" | "pending";
export type CompetitionStatus = "draft" | "active" | "scoring" | "closed";
export type CompetitionType = "hackathon" | "designathon" | "custom";
export type ScorecardStatus = "draft" | "submitted";
export type TeamStatus = "registered" | "submitted" | "disqualified";
export type TeamMemberRole = "leader" | "member";

export interface Organisation {
  contactEmail: string;
  createdAt: Timestamp;
  createdBy: string;
  id: string;
  name: string;
  slug: string;
}

export interface Competition {
  allowedDomains: string[];
  createdAt: Timestamp;
  createdBy: string;
  description: string;
  id: string;
  name: string;
  orgId: string;
  scoringConfig: {
    allowPartialSubmit: boolean;
    showLeaderboardTo: "evaluators_and_organizers" | "organizers_only";
    scoreVisibilityMode: "live" | "after_close";
    allowRescoring: boolean;
  };
  status: CompetitionStatus;
  teamMaxSize: number;
  teamMinSize: number;
  type: CompetitionType;
  updatedAt: Timestamp;
}

export interface Criterion {
  category: string;
  competitionId: string;
  description: string;
  id: string;
  isRequired: boolean;
  maxScore: number;
  name: string;
  order: number;
  weight: number;
}

export interface TeamMember {
  email: string;
  name: string;
  role: TeamMemberRole;
  studentId: string;
  university: string;
}

export interface Team {
  competitionId: string;
  domain: string;
  id: string;
  importedAt: Timestamp;
  members: TeamMember[];
  name: string;
  notes: string;
  projectTitle: string;
  status: TeamStatus;
  submissionUrl: string;
}

export interface Evaluator {
  addedAt: Timestamp;
  addedBy: string;
  assignedTeamIds: string[];
  competitionId: string;
  displayName: string;
  email: string;
  isActive: boolean;
  role: "evaluator" | "head_judge";
  uid: string;
}

export interface CriterionScoreData {
  remarks: string;
  score: number;
  updatedAt: Timestamp;
}

export interface Scorecard {
  competitionId: string;
  evaluatorId: string;
  id: string;
  scores: Record<string, CriterionScoreData>;
  status: ScorecardStatus;
  submittedAt: Timestamp | null;
  teamId: string;
  totalRawScore: number;
  updatedAt: Timestamp;
  weightedScore: number;
}

export interface LeaderboardCache {
  averageWeightedScore: number;
  domain: string;
  lastUpdated: Timestamp;
  rank: number;
  submittedScoreCount: number;
  teamId: string;
  teamName: string;
  totalEvaluators: number;
}

export interface Invitation {
  competitionId: string;
  createdAt: Timestamp;
  createdBy: string;
  email: string;
  expiresAt: Timestamp;
  id: string;
  orgId: string;
  role: UserRole;
  used: boolean;
  usedAt: Timestamp | null;
}

export interface AuditLog {
  action: string;
  actorEmail: string;
  actorUid: string;
  competitionId: string;
  id: string;
  meta: Record<string, unknown>;
  resourceId: string;
  resourceType: string;
  timestamp: Timestamp;
}

export interface CustomClaims {
  competitionIds: string[];
  orgId: string;
  role: UserRole;
}

// API Request/Response types
export interface CreateCompetitionRequest {
  allowedDomains: string[];
  description: string;
  name: string;
  scoringConfig: Competition["scoringConfig"];
  teamMaxSize: number;
  teamMinSize: number;
  type: CompetitionType;
}

export interface ImportTeamsRequest {
  competitionId: string;
  format: "csv" | "json";
  teams: Omit<Team, "id" | "competitionId" | "importedAt" | "status">[];
}

export interface ImportTeamsResponse {
  errors: Array<{ index: number; reason: string }>;
  imported: number;
}

export interface CreateInvitationRequest {
  assignedTeamIds?: string[];
  competitionId: string;
  email: string;
  orgId: string;
  role: UserRole;
}

export interface CreateInvitationResponse {
  emailSent?: boolean;
  expiresAt: string;
  inviteUrl: string;
  token: string;
}

export interface AcceptInvitationRequest {
  idToken: string;
  token: string;
}

export interface AcceptInvitationResponse {
  competitionId: string;
  role: UserRole;
  success: boolean;
}

export interface SubmitScoreRequest {
  competitionId: string;
  scores: Record<string, { score: number; remarks: string }>;
  teamId: string;
}

export interface SubmitScoreResponse {
  scorecardId: string;
  success: boolean;
  weightedScore: number;
}

export interface SessionResponse {
  competitionIds: string[];
  role: UserRole;
  success: boolean;
  uid: string;
}
