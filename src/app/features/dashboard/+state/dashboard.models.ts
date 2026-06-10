export interface DashboardMetrics {
  tenantsTotal: number;
  tenantsNew: number;
  erpUsers: number;
  blockedUsers: number;
  dbInstancesActive: number;
  dbInstancesInactive: number;
  alerts: string[];
}

export interface DashboardState {
  metrics: DashboardMetrics | null;
  loading: boolean;
  error: string | null;
}

export const initialDashboardState: DashboardState = {
  metrics: null,
  loading: false,
  error: null,
};
