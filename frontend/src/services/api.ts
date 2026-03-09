import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export interface DetectedApp {
  id: number | string;
  name: string;
  category: string;
  typical_price: number;
  risk_level?: string;
  employee?: string;
  department?: string;
  evidence?: string[];
  data_permissions?: string[];
}

export interface UploadResponse {
  detectedApps: DetectedApp[];
  totalApps: number;
  totalMonthlySpend: number;
  categories: string[];
}

export interface SavingsBreakdown {
  category: string;
  keptApp: string;
  removedApps: string[];
  saved: number;
}

export interface SimulationResult {
  monthlySavings: number;
  annualSavings: number;
  breakdown: SavingsBreakdown[];
}

export interface PlaybookSimulateResponse {
  status: string;
  revokeId: string;
  emailDraft: {
    to: string;
    subject: string;
    body: string;
  };
  newState: string;
  demo: boolean;
}

export interface PlaybookUndoResponse {
  status: string;
  newState: string;
  demo: boolean;
}

export async function uploadFiles(
  expenses: File | null,
  browserHistory: File | null
): Promise<UploadResponse> {
  const formData = new FormData();
  if (expenses) formData.append('expenses', expenses);
  if (browserHistory) formData.append('browser_history', browserHistory);

  const response = await api.post<UploadResponse>('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function simulateSavings(
  detectedApps: DetectedApp[],
  keepMap: Record<string, string>,
  adoption: number = 1.0
): Promise<SimulationResult> {
  const response = await api.post<SimulationResult>('/simulate', {
    detectedApps,
    keepMap,
    adoption,
  });
  return response.data;
}

export async function playbookSimulate(
  appId: string | number,
  appName: string,
  evidence: string[],
  tenant: string = 'company.local',
  actor: string = 'demo@company.local',
  risk_level?: string,
  data_permissions?: string[]
): Promise<PlaybookSimulateResponse> {
  const response = await api.post<PlaybookSimulateResponse>('/playbook/simulate', {
    appId,
    appName,
    evidence,
    tenant,
    actor,
    risk_level,
    data_permissions,
  });
  return response.data;
}

export async function playbookUndo(
  revokeId: string,
  actor: string = 'demo@company.local'
): Promise<PlaybookUndoResponse> {
  const response = await api.post<PlaybookUndoResponse>('/playbook/undo', {
    revokeId,
    actor,
  });
  return response.data;
}

export default api;
