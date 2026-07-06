import http from "./http";

const api = <T>(promise: Promise<{ data: { data: T } }>) =>
  promise.then((r) => r.data.data);

// ── Auth ──────────────────────────────────────────────────────────────
export const authApi = {
  login: (username: string, password: string) =>
    http.post<{ data: { token: string; username: string; role: string; fullName: string } }>("/auth/login", { username, password }),
  init: () => http.post("/auth/init"),
};

// ── Certifications ────────────────────────────────────────────────────
export const certApi = {
  getAll: () => api(http.get("/certifications")),
  getActive: () => api(http.get("/certifications/active")),
  getById: (id: number) => api(http.get(`/certifications/${id}`)),
  create: (data: Record<string, unknown>) => api(http.post("/certifications", data)),
  update: (id: number, data: Record<string, unknown>) => api(http.put(`/certifications/${id}`, data)),
  delete: (id: number) => http.delete(`/certifications/${id}`),
  uploadFile: (id: number, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return api(http.post(`/certifications/${id}/upload`, fd, { headers: { "Content-Type": "multipart/form-data" } }));
  },
  downloadFile: (id: number) =>
    http.get(`/certifications/${id}/download`, { responseType: "blob" }),
};

// ── Departments ───────────────────────────────────────────────────────
export const deptApi = {
  getAll: () => api(http.get("/departments")),
  getActive: () => api(http.get("/departments/active")),
  getById: (id: number) => api(http.get(`/departments/${id}`)),
  create: (data: Record<string, unknown>) => api(http.post("/departments", data)),
  update: (id: number, data: Record<string, unknown>) => api(http.put(`/departments/${id}`, data)),
  delete: (id: number) => http.delete(`/departments/${id}`),
};

// ── Users ─────────────────────────────────────────────────────────────
export const userApi = {
  getAll: () => api(http.get("/users")),
  getByRole: (role: string) => api(http.get(`/users/role/${role}`)),
  create: (data: Record<string, unknown>) => api(http.post("/users", data)),
  update: (id: number, data: Record<string, unknown>) => api(http.put(`/users/${id}`, data)),
  resetPassword: (id: number, password: string) =>
    http.post(`/users/${id}/reset-password`, { password }),
  toggleActive: (id: number) => http.post(`/users/${id}/toggle-active`),
  delete: (id: number) => http.delete(`/users/${id}`),
};

// ── Documents ─────────────────────────────────────────────────────────
export const docApi = {
  getAll: () => api(http.get("/documents")),
  getByCert: (certId: number) => api(http.get(`/documents/certification/${certId}`)),
  getById: (id: number) => api(http.get(`/documents/${id}`)),
  create: (data: FormData) =>
    api(http.post("/documents", data, { headers: { "Content-Type": "multipart/form-data" } })),
  update: (id: number, data: FormData) =>
    api(http.put(`/documents/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } })),
  approve: (id: number) => api(http.post(`/documents/${id}/approve`)),
  delete: (id: number) => http.delete(`/documents/${id}`),
  downloadMasterList: (certId: number) =>
    http.get(`/documents/reports/master-list/${certId}`, { responseType: "blob" }),
  generateNumber: (companyCode: string, deptCode: string, docType: string) =>
    api(http.get("/documents/generate-number", { params: { companyCode, deptCode, docType } })),
};

// ── Issue Register ────────────────────────────────────────────────────
export const issueApi = {
  getAll: () => api(http.get("/issue-register")),
  getByCert: (certId: number) => api(http.get(`/issue-register/certification/${certId}`)),
  getByDoc: (docId: number) => api(http.get(`/issue-register/document/${docId}`)),
  create: (data: Record<string, unknown>) => api(http.post("/issue-register", data)),
  update: (id: number, data: Record<string, unknown>) => api(http.put(`/issue-register/${id}`, data)),
  updateStatus: (id: number, status: string) =>
    api(http.put(`/issue-register/${id}/status`, null, { params: { status } })),
  delete: (id: number) => http.delete(`/issue-register/${id}`),
};

// ── KPI ───────────────────────────────────────────────────────────────
export const kpiApi = {
  getMasters: () => api(http.get("/kpi/masters")),
  getMastersByCert: (certId: number) => api(http.get(`/kpi/masters/certification/${certId}`)),
  createMaster: (data: Record<string, unknown>) => api(http.post("/kpi/masters", data)),
  updateMaster: (id: number, data: Record<string, unknown>) => api(http.put(`/kpi/masters/${id}`, data)),
  deleteMaster: (id: number) => http.delete(`/kpi/masters/${id}`),

  getEntries: (certId: number, year: number, month?: string) =>
    api(http.get(`/kpi/entries/certification/${certId}`, { params: { year, month } })),
  saveEntry: (data: Record<string, unknown>) => api(http.post("/kpi/entries", data)),
  approveEntry: (id: number, reviewedBy: string) =>
    api(http.post(`/kpi/entries/${id}/approve`, null, { params: { reviewedBy } })),

  downloadReport: (certId: number, year: number, month: string) =>
    http.get(`/kpi/reports/${certId}`, { params: { year, month }, responseType: "blob" }),
};

// ── Audit ─────────────────────────────────────────────────────────────
export const auditApi = {
  getPlans: () => api(http.get("/audit/plans")),
  getPlansByCert: (certId: number) => api(http.get(`/audit/plans/certification/${certId}`)),
  getPlanById: (id: number) => api(http.get(`/audit/plans/${id}`)),
  createPlan: (data: Record<string, unknown>) => api(http.post("/audit/plans", data)),
  updatePlan: (id: number, data: Record<string, unknown>) => api(http.put(`/audit/plans/${id}`, data)),
  deletePlan: (id: number) => http.delete(`/audit/plans/${id}`),
  approvePlan: (id: number, approvedBy: string) =>
    api(http.post(`/audit/plans/${id}/approve`, { approvedBy })),
  downloadPlanReport: (id: number) =>
    http.get(`/audit/plans/${id}/report`, { responseType: "blob" }),

  getSchedules: () => api(http.get("/audit/schedules")),
  getSchedulesByPlan: (planId: number) => api(http.get(`/audit/schedules/plan/${planId}`)),
  createSchedule: (data: Record<string, unknown>) => api(http.post("/audit/schedules", data)),
  updateSchedule: (id: number, data: Record<string, unknown>) => api(http.put(`/audit/schedules/${id}`, data)),
  deleteSchedule: (id: number) => http.delete(`/audit/schedules/${id}`),

  getObsByPlan: (planId: number) => api(http.get(`/audit/observations/plan/${planId}`)),
  getObsByCert: (certId: number) => api(http.get(`/audit/observations/certification/${certId}`)),
  createObs: (data: Record<string, unknown>) => api(http.post("/audit/observations", data)),
  updateObs: (id: number, data: Record<string, unknown>) => api(http.put(`/audit/observations/${id}`, data)),
  deleteObs: (id: number) => http.delete(`/audit/observations/${id}`),
 getAllNcs: () => api(http.get("/audit/nc")),
  getNcsByCert: (certId: number) => api(http.get(`/audit/nc/certification/${certId}`)),
  getNcsByPlan: (planId: number) => api(http.get(`/audit/nc/plan/${planId}`)), // Added this
  getOpenNcs: () => api(http.get("/audit/nc/open")),
  getNcById: (id: number) => api(http.get(`/audit/nc/${id}`)),
  createNc: (data: Record<string, unknown>) => api(http.post("/audit/nc", data)),
  updateNc: (id: number, data: Record<string, unknown>) => api(http.put(`/audit/nc/${id}`, data)),
  closeNc: (id: number) => api(http.post(`/audit/nc/${id}/close`)),
  downloadNcReport: (certId: number) =>
    http.get(`/audit/reports/nc/${certId}`, { responseType: "blob" }),

  // ===== ✅ NEW: Helper endpoints for NC creation =====
  getDepartmentsForPlan: (planId: number) => 
    api(http.get(`/audit/nc/plan/${planId}/departments`)),
    
  getClausesForPlanAndDepartment: (planId: number, department?: string) => 
    api(http.get(`/audit/nc/plan/${planId}/clauses`, { params: { department } })),
    
  getObservationsForNcCreation: (planId: number) => 
    api(http.get(`/audit/nc/plan/${planId}/observations`)),
  // ===== Feedback endpoints =====
  getAllFeedback: () => api(http.get("/audit/feedback")),
  getFeedbackByPlan: (planId: number) => api(http.get(`/audit/feedback/plan/${planId}`)),
  createFeedback: (data: Record<string, unknown>) => api(http.post("/audit/feedback", data)),
  updateFeedback: (id: number, data: Record<string, unknown>) => api(http.put(`/audit/feedback/${id}`, data)),
  deleteFeedback: (id: number) => http.delete(`/audit/feedback/${id}`),
};

// ── Clause Master ────────────────────────────────────────────────────
export const clauseApi = {
  getAll:            ()                              => api(http.get("/audit/clauses")),
  getByCert:         (certId: number)                => api(http.get(`/audit/clauses/certification/${certId}`)),
  getByDept:         (deptId: number)                => api(http.get(`/audit/clauses/department/${deptId}`)),
  getForObservation: (certId: number, deptId: number) =>
    api(http.get("/audit/clauses/observation", { params: { certId, deptId } })),
  getById:           (id: number)                    => api(http.get(`/audit/clauses/${id}`)),
  create:            (data: Record<string, unknown>)                     => api(http.post("/audit/clauses", data)),
  update:            (id: number, data: Record<string, unknown>)         => api(http.put(`/audit/clauses/${id}`, data)),
  delete:            (id: number)                    => http.delete(`/audit/clauses/${id}`),
};

// ── MRM ───────────────────────────────────────────────────────────────
export const mrmApi = {
  getPlans: () => api(http.get("/mrm/plans")),
  getPlansByCert: (certId: number) => api(http.get(`/mrm/plans/certification/${certId}`)),
  getPlanById: (id: number) => api(http.get(`/mrm/plans/${id}`)),
  createPlan: (data: Record<string, unknown>) => api(http.post("/mrm/plans", data)),
  updatePlan: (id: number, data: Record<string, unknown>) => api(http.put(`/mrm/plans/${id}`, data)),
  submitPlan: (id: number) => api(http.post(`/mrm/plans/${id}/submit`)),
  approvePlan: (id: number, approvedBy: string) =>
    api(http.post(`/mrm/plans/${id}/approve`, { approvedBy })),
  rejectPlan: (id: number, rejectedBy: string) =>
    api(http.post(`/mrm/plans/${id}/reject`, { rejectedBy })),
  updateMom: (id: number, data: Record<string, unknown>) =>
    api(http.put(`/mrm/plans/${id}/mom`, data)),
  deletePlan: (id: number) => http.delete(`/mrm/plans/${id}`),

  getAgenda: (planId: number) => api(http.get(`/mrm/agenda/plan/${planId}`)),
  saveAgenda: (data: Record<string, unknown>) => api(http.post("/mrm/agenda", data)),
  deleteAgenda: (id: number) => http.delete(`/mrm/agenda/${id}`),

  getMinutes: (planId: number) => api(http.get(`/mrm/minutes/plan/${planId}`)),
  getPendingActions: () => api(http.get("/mrm/minutes/pending-actions")),
  saveMinutes: (data: Record<string, unknown>) => api(http.post("/mrm/minutes", data)),
  updateMinutes: (id: number, data: Record<string, unknown>) => api(http.put(`/mrm/minutes/${id}`, data)),
  deleteMinutes: (id: number) => http.delete(`/mrm/minutes/${id}`),
  updateMinutesStatus: (id: number, status: string) =>
    api(http.put(`/mrm/minutes/${id}/status`, null, { params: { status } })),
};

// ── CAR ───────────────────────────────────────────────────────────────
export const carApi = {
  getAll: () => api(http.get("/cars")),
  getByCert: (certId: number) => api(http.get(`/cars/certification/${certId}`)),
  getByNc: (ncId: number) => api(http.get(`/cars/nc/${ncId}`)),
  getOpen: () => api(http.get("/cars/open")),
  getById: (id: number) => api(http.get(`/cars/${id}`)),
  create: (data: Record<string, unknown>) => api(http.post("/cars", data)),
  update: (id: number, data: Record<string, unknown>) => api(http.put(`/cars/${id}`, data)),
  updateStatus: (id: number, status: string) =>
    api(http.put(`/cars/${id}/status`, null, { params: { status } })),
  delete: (id: number) => http.delete(`/cars/${id}`),
};

// ── Process Review Plan ───────────────────────────────────────────────
export const prpApi = {
  getAll: () => api(http.get("/process-review-plans")),
  getByMrm: (mrmPlanId: number) => api(http.get(`/process-review-plans/mrm/${mrmPlanId}`)),
  getByCert: (certId: number) => api(http.get(`/process-review-plans/certification/${certId}`)),
  getById: (id: number) => api(http.get(`/process-review-plans/${id}`)),
  create: (data: Record<string, unknown>) => api(http.post("/process-review-plans", data)),
  update: (id: number, data: Record<string, unknown>) => api(http.put(`/process-review-plans/${id}`, data)),
  delete: (id: number) => http.delete(`/process-review-plans/${id}`),
};

// ── Process Review Sheet ──────────────────────────────────────────────
export const prsApi = {
  getAll: () => api(http.get("/process-review-sheets")),
  getByPlan: (planId: number) => api(http.get(`/process-review-sheets/plan/${planId}`)),
  getByMrm: (mrmPlanId: number) => api(http.get(`/process-review-sheets/mrm/${mrmPlanId}`)),
  getById: (id: number) => api(http.get(`/process-review-sheets/${id}`)),
  create: (data: Record<string, unknown>) => api(http.post("/process-review-sheets", data)),
  update: (id: number, data: Record<string, unknown>) => api(http.put(`/process-review-sheets/${id}`, data)),
  delete: (id: number) => http.delete(`/process-review-sheets/${id}`),
};

// ── KPI Review ────────────────────────────────────────────────────────
export const kpiReviewApi = {
  getAll: () => api(http.get("/kpi-reviews")),
  getByCert: (certId: number) => api(http.get(`/kpi-reviews/certification/${certId}`)),
  getByMrm: (mrmPlanId: number) => api(http.get(`/kpi-reviews/mrm/${mrmPlanId}`)),
  getById: (id: number) => api(http.get(`/kpi-reviews/${id}`)),
  loadKpiData: (certId: number, year?: number) =>
    api(http.get("/kpi-reviews/load-kpi-data", { params: { certId, year } })),
  create: (data: Record<string, unknown>) => api(http.post("/kpi-reviews", data)),
  update: (id: number, data: Record<string, unknown>) => api(http.put(`/kpi-reviews/${id}`, data)),
  delete: (id: number) => http.delete(`/kpi-reviews/${id}`),
};

// ── Internal Audit Review ─────────────────────────────────────────────
export const auditReviewApi = {
  getAll: () => api(http.get("/audit-reviews")),
  getByCert: (certId: number) => api(http.get(`/audit-reviews/certification/${certId}`)),
  getByMrm: (mrmPlanId: number) => api(http.get(`/audit-reviews/mrm/${mrmPlanId}`)),
  getById: (id: number) => api(http.get(`/audit-reviews/${id}`)),
  getDashboardData: (certId: number) =>
    api(http.get("/audit-reviews/dashboard-data", { params: { certId } })),
  create: (data: Record<string, unknown>) => api(http.post("/audit-reviews", data)),
  update: (id: number, data: Record<string, unknown>) => api(http.put(`/audit-reviews/${id}`, data)),
  delete: (id: number) => http.delete(`/audit-reviews/${id}`),
};

// ── Action Tracker ────────────────────────────────────────────────────
export const actionTrackerApi = {
  getAll: () => api(http.get("/action-trackers")),
  getOpen: () => api(http.get("/action-trackers/open")),
  getOverdue: () => api(http.get("/action-trackers/overdue")),
  getBySourceRef: (ref: string) => api(http.get(`/action-trackers/source/${ref}`)),
  getById: (id: number) => api(http.get(`/action-trackers/${id}`)),
  getDashboard: () => api(http.get("/action-trackers/dashboard")),
  create: (data: Record<string, unknown>) => api(http.post("/action-trackers", data)),
  update: (id: number, data: Record<string, unknown>) => api(http.put(`/action-trackers/${id}`, data)),
  updateStatus: (id: number, status: string) =>
    api(http.put(`/action-trackers/${id}/status`, null, { params: { status } })),
  updateProgress: (id: number, data: Record<string, unknown>) =>
    api(http.put(`/action-trackers/${id}/progress`, data)),
  delete: (id: number) => http.delete(`/action-trackers/${id}`),
};

// ── Designations ─────────────────────────────────────────────────────────
export const designationApi = {
  getAll:          ()                    => api(http.get("/designations")),
  getActive:       ()                    => api(http.get("/designations/active")),
  getByDept:       (deptId: number)      => api(http.get(`/designations/department/${deptId}`)),
  getActiveByDept: (deptId: number)      => api(http.get(`/designations/department/${deptId}/active`)),
  getById:         (id: number)          => api(http.get(`/designations/${id}`)),
  create:          (data: Record<string, unknown>)           => api(http.post("/designations", data)),
  update:          (id: number, data: Record<string, unknown>) => api(http.put(`/designations/${id}`, data)),
  delete:          (id: number)          => http.delete(`/designations/${id}`),
};

// ── Auditors ──────────────────────────────────────────────────────────
export const auditorApi = {
  getAll: () => api(http.get("/auditors")),
  getByType: (type: string) => api(http.get(`/auditors/type/${type}`)),
  getById: (id: number) => api(http.get(`/auditors/${id}`)),
  create: (data: unknown) => api(http.post("/auditors", data)),
  update: (id: number, data: unknown) => api(http.put(`/auditors/${id}`, data)),
  delete: (id: number) => http.delete(`/auditors/${id}`),
};

// ── Employees ─────────────────────────────────────────────────────────
export const employeeApi = {
  getAll: () => api(http.get("/employees")),
  getByDept: (deptId: number) => api(http.get(`/employees/department/${deptId}`)),
  getById: (id: number) => api(http.get(`/employees/${id}`)),
  create: (data: unknown) => api(http.post("/employees", data)),
  update: (id: number, data: unknown) => api(http.put(`/employees/${id}`, data)),
  delete: (id: number) => http.delete(`/employees/${id}`),
};

// ── Dashboard ─────────────────────────────────────────────────────────
export const dashboardApi = {
  getStats: () => api(http.get("/dashboard/stats")),
};

// ── Activity Log ──────────────────────────────────────────────────────
export const activityApi = {
  getRecent: (limit = 50) => api(http.get("/activity-logs/recent", { params: { limit } })),
};

// ── Document Issue Register ───────────────────────────────────────────
export const docIssueApi = {
  getAll: () => api(http.get("/document-issues")),
  getByCert: (certId: number) => api(http.get(`/document-issues/certification/${certId}`)),
  create: (data: Record<string, unknown>) => api(http.post("/document-issues", data)),
  update: (id: number, data: Record<string, unknown>) => api(http.put(`/document-issues/${id}`, data)),
  delete: (id: number) => http.delete(`/document-issues/${id}`),
  updateStatus: (id: number, status: string) =>
    api(http.put(`/document-issues/${id}/status`, null, { params: { status } })),
  acknowledge: (id: number) => api(http.post(`/document-issues/${id}/acknowledge`)),
  markReturn: (id: number, returnDate: string) =>
    api(http.post(`/document-issues/${id}/return`, null, { params: { returnDate } })),
};

// ── Helpers ───────────────────────────────────────────────────────────
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
