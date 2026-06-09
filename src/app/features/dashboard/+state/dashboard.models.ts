import { DashboardMetrics } from "@app/core/services/dashboard-api.service";

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
