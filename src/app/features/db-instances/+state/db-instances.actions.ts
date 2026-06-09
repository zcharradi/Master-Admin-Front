import { createAction, props } from "@ngrx/store";

import { ApiListResponse } from "@app/shared/models/pagination.model";
import { DbInstance } from "./db-instances.models";

export const loadDbInstances = createAction("[DB] Load Instances");
export const loadDbInstancesSuccess = createAction("[DB] Load Instances Success", props<{ response: ApiListResponse<DbInstance> }>());
export const loadDbInstancesFailure = createAction("[DB] Load Instances Failure", props<{ error: string }>());

export const selectDbInstance = createAction("[DB] Select", props<{ id: string | null }>());

export const updateDbInstance = createAction("[DB] Update", props<{ id: string; changes: Partial<DbInstance> }>());
export const updateDbInstanceSuccess = createAction("[DB] Update Success", props<{ instance: DbInstance }>());

export const updateDbCredentials = createAction(
  "[DB] Update Credentials",
  props<{ id: string; payload: { adminPassword?: string; password?: string; readOnlyPassword?: string } }>()
);
export const updateDbCredentialsSuccess = createAction("[DB] Update Credentials Success", props<{ id: string }>());
