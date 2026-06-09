import { createListAdapter, createInitialListState, ListState } from "@app/shared/state/entity-state";

export interface Tenant {
  id: string;
  uuid: string;
  entityName: string;
  dbInstanceId?: string;
  isActive: boolean;
  modules?: string[];
  industries?: string[];
  createdAt?: string;
}

export interface TenantFilters {
  search?: string;
  isActive?: boolean;
}

export type TenantsState = ListState<Tenant, TenantFilters>;

export const tenantsAdapter = createListAdapter<Tenant>((tenant) => tenant.id || tenant.uuid);
export const initialTenantsState: TenantsState = createInitialListState<Tenant, TenantFilters>(tenantsAdapter, {});
