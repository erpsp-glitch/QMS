// ── Shared references ─────────────────────────────────────────────────────
export interface CertRef { id: number; name?: string; code?: string }
export interface DeptRef  { id: number; name?: string }

// ── Event helper ──────────────────────────────────────────────────────────
export type InputChg = React.ChangeEvent<
  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
>;

// ── Error helper ──────────────────────────────────────────────────────────
interface ApiError { response?: { data?: { message?: string } } }
export const apiMsg = (e: unknown, fallback = "Operation failed"): string =>
  (e as ApiError)?.response?.data?.message ?? fallback;

// ── Domain interfaces ─────────────────────────────────────────────────────

export interface Certification {
  id: number;
  code: string;
  name: string;
  standardName?: string;
  standardVersion?: string;
  standardType?: string;
  industrySector?: string;
  certificationBody?: string;
  certificateNumber?: string;
  scope?: string;
  applicableClauses?: string;
  reminderSettings?: string;
  issueDate?: string;
  expiryDate?: string;
  surveillanceDate?: string;
  renewalDate?: string;
  status: string;
  createdAt?: string;
}

export interface Department {
  id: number;
  departmentId?: string;
  name: string;
  departmentCode?: string;
  departmentHead?: string;
  email?: string;
  phone?: string;
  location?: string;
  processName?: string;
  processOwner?: string;
  description?: string;
  remarks?: string;
  active: boolean;
  createdAt?: string;
}

export interface Designation {
  id: number;
  name: string;
  description?: string;
  department?: DeptRef | null;
  active: boolean;
}

export interface User {
  id: number;
  username: string;
  fullName?: string;
  email?: string;
  role: string;
  employeeCode?: string;
  phone?: string;
  active?: boolean;
  department?: DeptRef | null;
  createdAt?: string;
}

export interface Employee {
  id: number;
  employeeId?: string;
  firstName: string;
  lastName?: string;
  department?: DeptRef | null;
  designation?: string;
  reportingToId?: number | null;
  reportingToName?: string;
  email?: string;
  personalEmail?: string;
  phone?: string;
  alternativeNumber?: string;
  joiningDate?: string | null;
  dateOfBirth?: string | null;
  highestQualification?: string;
  professionalCertifications?: string;
  skills?: string;
  yearsOfExperience?: number | null;
  role?: string;
  status?: string;
  remarks?: string;
}

export interface Auditor {
  id: number;
  name?: string;
  auditorCode?: string;
  type?: string;
  department?: string;
  organization?: string;
  organizationType?: string;
  branch?: string;
  qualification?: string;
  competencyLevel?: string;
  leadAuditorCertNo?: string;
  certIssueDate?: string | null;
  certExpiryDate?: string | null;
  assignedStandards?: string;
  auditScope?: string;
  experienceYears?: number | null;
  auditHours?: number | null;
  areaOfExpertise?: string;
  certifications?: string[];
  email?: string;
  phone?: string;
  resumePath?: string;
  status?: string;
  remarks?: string;
}

export interface Document {
  id: number;
  documentNumber?: string;
  documentName?: string;
  title?: string;
  docType?: string;
  documentType?: string;
  category?: string;
  level?: string;
  documentLevel?: string;
  revision?: string;
  revisionNumber?: string;
  revisionDate?: string;
  status?: string;
  approvedBy?: string;
  approvedById?: string;
  approvalDate?: string;
  effectiveDate?: string;
  reviewDate?: string;
  nextReviewDate?: string;
  reviewFrequency?: string;
  companyCode?: string;
  deptCode?: string;
  scope?: string;
  owner?: string;
  preparedBy?: string;
  preparedById?: string;
  reviewedBy?: string;
  reviewedById?: string;
  keywords?: string;
  changeDescription?: string;
  description?: string;
  referenceNumber?: string;
  copyType?: string;
  filePath?: string;
  certification?: CertRef | null;
  department?: DeptRef | null;
  createdAt?: string;
  fileName?: string;
}

export interface KpiMaster {
  id: number;
  kpiCode?: string;
  kpiObjective?: string;
  objective?: string;
  title?: string;
  kpiCategory?: string;
  kpiType?: string;
  unit?: string;
  frequency?: string;
  financialYear?: string;
  targetValue?: number | string;
  direction?: string;
  warningLimit?: number | string;
  criticalLimit?: number | string;
  dataSource?: string;
  calculationFormula?: string;
  responsiblePerson?: string;
  monitoringPerson?: string;
  active?: boolean;
  certification?: CertRef | null;
  department?: DeptRef | null;
  departmentName?: string;
  capaRequired?: boolean;
  capaStatus?: string;
}

export interface KpiEntry {
  id: number;
  kpiMaster?: Pick<KpiMaster, "id" | "kpiCode" | "kpiObjective" | "targetValue" | "unit"> | null;
  kpiCode?: string;
  certification?: CertRef | null;
  year?: number;
  month?: string;
  actualValue?: number | null;
  status?: string;
  remarks?: string;
  enteredBy?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt?: string;
}

export interface AuditPlan {
  id: number;
  planRefNo?: string;
  certification?: CertRef | null;
  auditType?: string;
  auditTitle?: string;
  leadAuditor?: string;
  auditorTeam?: string;
  scope?: string;
  auditCriteria?: string;
  objective?: string;
  plannedStartDate?: string;
  plannedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  durationDays?: number | string;
  status?: string;
  approvalStatus?: string;
  approvedBy?: string;
  remarks?: string;
  createdAt?: string;
}

export interface AuditSchedule {
  id: number;
  auditPlan?: Pick<AuditPlan, "id"> | null;
  department?: string;
  location?: string;
  auditee?: string;
  auditDate?: string;
  startTime?: string;
  endTime?: string;
  createdAt?: string;
}

export interface AuditObservation {
  id: number;
  auditSchedule?: Pick<AuditSchedule, "id"> | null;
  auditPlan?: Pick<AuditPlan, "id"> | null;
  certification?: CertRef | null;
  clauseNo?: string;
  clauseTitle?: string;
  requirement?: string;
  auditQuestion?: string;
  findingType?: string;
  observationDescription?: string;
  objectiveEvidence?: string;
  riskLevel?: string;
  severity?: string;
  department?: string;
  auditee?: string;
  auditDate?: string;
  createdAt?: string;
}

export interface NC {
  id: number;
  ncNumber?: string;
  ncType?: string;
  clauseNo?: string;
  ncDescription?: string;
  department?: string;
  auditorName?: string;
  auditeeName?: string;
  auditDate?: string;
  containmentAction?: string;
  immediateCorrection?: string;
  rootCauseMethod?: string;
  rootCause?: string;
  correctiveAction?: string;
  responsiblePerson?: string;
  targetDate?: string;
  priority?: string;
  verificationBy?: string;
  verificationDate?: string;
  verificationRemarks?: string;
  evidencePath?: string;
  closureDate?: string;
  status?: string;
  auditPlan?: Pick<AuditPlan, "id"> | null;
  certification?: CertRef | null;
  createdAt?: string;
}

export interface AuditFeedback {
  id: number;
  auditPlan?: Pick<AuditPlan, "id"> | null;
  certification?: CertRef | null;
  auditorName?: string;
  auditeeName?: string;
  process?: string;
  auditDate?: string;
  auditorKnowledge?: number;
  technicalCompetency?: number;
  auditCoverage?: number;
  auditorQualities?: number;
  employeeInteraction?: number;
  clarityInCommunication?: number;
  timeManagement?: number;
  consistencyApproach?: number;
  queryResponse?: number;
  observationComments?: number;
  incidentExplanation?: string;
  valueAdditions?: string;
  suggestions?: string;
  createdAt?: string;
}

export interface ClauseMaster {
  id: number;
  mainClauseNumber?: string;
  mainClauseTitle?: string;
  subClauseReference?: string;
  subClauseTitle?: string;
  requirement?: string;
  auditQuestion?: string;
  status?: string;
  createdBy?: string;
  updatedBy?: string;
  certification?: CertRef | null;
  department?: DeptRef | null;
}

export interface MrmPlan {
  id: number;
  mrmRefNo?: string;
  mrmType?: string;
  chairman?: string;
  mrRepresentative?: string;
  coordinator?: string;
  meetingDate?: string;
  meetingTime?: string;
  meetingLocation?: string;
  financialYear?: string;
  scope?: string;
  status?: string;
  remarks?: string;
  certification?: CertRef | null;
  attendees?: string[];
  invitees?: string[];
  // Approval
  approvalStatus?: string;
  approvedBy?: string;
  approvalDate?: string;
  // MOM conclusion
  momStatus?: string;
  meetingConclusion?: string;
  overallEffectiveness?: string;
  preparedBy?: string;
  momReviewedBy?: string;
  momApprovedBy?: string;
  momApprovalDate?: string;
  createdAt?: string;
}

export interface MrmAgenda {
  id: number;
  mrmPlan?: Pick<MrmPlan, "id"> | null;
  serialNo?: number;
  agendaTopic?: string;
  inputDetails?: string;
  responsibility?: string;
}

export interface MrmMinutes {
  id: number;
  mrmPlan?: Pick<MrmPlan, "id"> | null;
  agendaTopic?: string;
  inputDetails?: string;
  discussionDetails?: string;
  decisionTaken?: string;
  actionRequired?: boolean;
  responsiblePerson?: string;
  targetDate?: string;
  remarks?: string;
  closureDate?: string;
  closureRemarks?: string;
  priority?: string;
  status?: string;
  createdAt?: string;
}

export interface IssueRegister {
  id: number;
  issueNumber?: string;
  title?: string;
  issueType?: string;
  status?: string;
  severity?: string;
  certification?: CertRef | null;
  department?: DeptRef | null;
  document?: Pick<Document, "id"> | null;
  reportedBy?: string;
  raisedBy?: string;
  reportedDate?: string;
  resolvedBy?: string;
  resolvedDate?: string;
  description?: string;
  resolution?: string;
  rootCause?: string;
  correctiveAction?: string;
  assignedTo?: string;
  targetDate?: string;
  dueDate?: string;
  priority?: string;
  category?: string;
  remarks?: string;
}

export interface DocumentIssue {
  id: number;
  issueId?: string;
  issueNumber?: string;
  document?: Pick<Document, "id" | "title" | "documentNumber"> | null;
  certification?: CertRef | null;
  certificationId?: number | null;
  documentId?: number | null;
  employeeId?: number | null;
  issuedTo?: string;
  issuedBy?: string;
  issueToEmployee?: string;
  employeeCode?: string;
  employeeDepartment?: string;
  department?: string;
  designation?: string;
  issueDate?: string;
  purpose?: string;
  status?: string;
  acknowledgementStatus?: string;
  acknowledgedAt?: string;
  returnDate?: string;
  copyType?: string;
  copyNumber?: string;
  remarks?: string;
  returnRequired?: boolean;
  expectedReturnDate?: string;
  certificationName?: string;
  certificationNumber?: string;
  documentNumber?: string;
  documentName?: string;
  referenceNumber?: string;
  revisionNumber?: string;
  revisionDate?: string;
}

export interface ActivityLog {
  id: number;
  action?: string;
  entityType?: string;
  entityId?: number;
  description?: string;
  performedBy?: string;
  username?: string;
  createdAt?: string;
}

export interface Car {
  id: number;
  carNumber?: string;
  ncTracking?: { id: number; ncNumber?: string } | null;
  certification?: CertRef | null;
  auditPlan?: Pick<AuditPlan, "id"> | null;
  department?: string;
  clause?: string;
  ncType?: string;
  priority?: string;
  ncDescription?: string;
  containmentAction?: string;
  responsiblePerson?: string;
  targetDate?: string;
  rcaMethod?: string;
  rootCause?: string;
  correctiveAction?: string;
  verificationBy?: string;
  verificationDate?: string;
  verificationRemarks?: string;
  evidenceReference?: string;
  closureDate?: string;
  closureRemarks?: string;
  status?: string;
  createdAt?: string;
}

export interface ProcessReviewPlan {
  id: number;
  prpRefNo?: string;
  mrmPlan?: Pick<MrmPlan, "id" | "mrmRefNo"> | null;
  certification?: CertRef | null;
  reviewDate?: string;
  department?: DeptRef | null;
  processName?: string;
  departmentHead?: string;
  reviewer?: string;
  plannedReviewDate?: string;
  reviewScope?: string;
  reviewObjective?: string;
  reviewCriteria?: string;
  remarks?: string;
  status?: string;
  createdAt?: string;
}

export interface ReviewChecklistItem {
  serialNo: number;
  reviewPoint: string;
  description?: string;
  status: string;
  remarks?: string;
}

export interface ProcessReviewSheet {
  id: number;
  prsRefNo?: string;
  processReviewPlan?: Pick<ProcessReviewPlan, "id" | "prpRefNo"> | null;
  department?: string;
  processName?: string;
  processOwner?: string;
  processReviewedBy?: string;
  lastReviewDate?: string;
  currentReviewDate?: string;
  reviewChecklist?: ReviewChecklistItem[];
  processEffectiveness?: string;
  kpiAchievement?: string;
  auditFindingsImpact?: string;
  customerFeedbackImpact?: string;
  risksIdentified?: string;
  opportunitiesForImprovement?: string;
  overallComments?: string;
  recommendation?: string;
  actionRequired?: boolean;
  actionResponsiblePerson?: string;
  actionTargetDate?: string;
  status?: string;
  reviewedBy?: string;
  reviewDate?: string;
  createdAt?: string;
}

export interface KpiReviewItem {
  kpiCode?: string;
  kpiName?: string;
  department?: string;
  frequency?: string;
  target?: number;
  unit?: string;
  actualValue?: number | null;
  achievementPercent?: number | null;
  achievementStatus?: string;
  remarks?: string;
}

export interface KpiReview {
  id: number;
  kpiReviewId?: string;
  mrmPlan?: Pick<MrmPlan, "id" | "mrmRefNo"> | null;
  certification?: CertRef | null;
  reviewDate?: string;
  financialYear?: string;
  kpiPerformanceItems?: KpiReviewItem[];
  totalKpiReviewed?: number;
  achieved?: number;
  partiallyAchieved?: number;
  notAchieved?: number;
  reviewDecision?: string;
  managementComments?: string;
  responsiblePerson?: string;
  targetCompletionDate?: string;
  reviewStatus?: string;
  reviewedBy?: string;
  reviewedDate?: string;
  createdAt?: string;
}

export interface InternalAuditReview {
  id: number;
  auditReviewId?: string;
  mrmPlan?: Pick<MrmPlan, "id" | "mrmRefNo"> | null;
  certification?: CertRef | null;
  reviewDate?: string;
  financialYear?: string;
  totalAuditsConducted?: number;
  totalClausesAudited?: number;
  totalConformance?: number;
  totalObservations?: number;
  totalOfi?: number;
  totalNc?: number;
  openNc?: number;
  closedNc?: number;
  overdueNc?: number;
  openCar?: number;
  closedCar?: number;
  managementComments?: string;
  reviewDecision?: string;
  responsiblePerson?: string;
  targetCompletionDate?: string;
  reviewStatus?: string;
  reviewedBy?: string;
  approvedBy?: string;
  approvalDate?: string;
  createdAt?: string;
}

export interface ActionTracker {
  id: number;
  actionNo?: string;
  sourceModule?: string;
  sourceReferenceNo?: string;
  actionDate?: string;
  priority?: string;
  status?: string;
  actionDescription?: string;
  responsiblePerson?: string;
  department?: string;
  targetCompletionDate?: string;
  remarks?: string;
  reminderRequired?: boolean;
  reminderFrequency?: string;
  reminderDaysBeforeDue?: number;
  escalationRequired?: boolean;
  progressUpdate?: string;
  completionPercent?: number;
  updatedBy?: string;
  updateDate?: string;
  verificationRequired?: boolean;
  verifiedBy?: string;
  verificationDate?: string;
  verificationRemarks?: string;
  closureEvidence?: string;
  closureDate?: string;
  closureRemarks?: string;
  reviewedBy?: string;
  approvedBy?: string;
  approvalDate?: string;
  createdAt?: string;
}
