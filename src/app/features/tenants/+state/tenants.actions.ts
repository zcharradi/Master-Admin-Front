import { createAction, props } from "@ngrx/store";

import { Tenant, TenantFilters } from "./tenants.models";
import { ApiListResponse } from "@app/shared/models/pagination.model";

export const loadTenants = createAction("[Tenants] Load", props<{ filters?: TenantFilters }>());
export const loadTenantsSuccess = createAction("[Tenants] Load Success", props<{ response: ApiListResponse<Tenant> }>());
export const loadTenantsFailure = createAction("[Tenants] Load Failure", props<{ error: string }>());

export const selectTenant = createAction("[Tenants] Select", props<{ id: string }>());
export const setTenantFilters = createAction("[Tenants] Set Filters", props<{ filters: TenantFilters }>());

export const createTenant = createAction("[Tenants] Create", props<{ payload: Partial<Tenant> }>());
export const createTenantSuccess = createAction("[Tenants] Create Success", props<{ tenant: Tenant }>());
export const updateTenant = createAction("[Tenants] Update", props<{ id: string; changes: Partial<Tenant> }>());
export const updateTenantSuccess = createAction("[Tenants] Update Success", props<{ tenant: Tenant }>());
export const deleteTenant = createAction("[Tenants] Delete", props<{ id: string }>());
export const deleteTenantSuccess = createAction("[Tenants] Delete Success", props<{ id: string }>());