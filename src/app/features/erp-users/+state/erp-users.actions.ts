import { createAction, props } from "@ngrx/store";

import { ApiListResponse } from "@app/shared/models/pagination.model";
import { ErpUser } from "./erp-users.models";

export const loadErpUsers = createAction("[ERP Users] Load");
export const loadErpUsersSuccess = createAction("[ERP Users] Load Success", props<{ response: ApiListResponse<ErpUser> }>());
export const loadErpUsersFailure = createAction("[ERP Users] Load Failure", props<{ error: string }>());

export const updateErpUser = createAction("[ERP Users] Update", props<{ id: string; changes: Partial<ErpUser> }>());
export const updateErpUserSuccess = createAction("[ERP Users] Update Success", props<{ user: ErpUser }>());