import { createAction, props } from "@ngrx/store";

import { ApiListResponse } from "@app/shared/models/pagination.model";
import { MasterAdmin } from "../reducers";

export const loadMasterAdmins = createAction("[Master Admins] Load");
export const loadMasterAdminsSuccess = createAction("[Master Admins] Load Success", props<{ response: ApiListResponse<MasterAdmin> }>());
export const loadMasterAdminsFailure = createAction("[Master Admins] Load Failure", props<{ error: string }>());

export const updateMasterAdmin = createAction("[Master Admins] Update", props<{ id: string; changes: Partial<MasterAdmin> }>());
export const updateMasterAdminSuccess = createAction("[Master Admins] Update Success", props<{ admin: MasterAdmin }>());
