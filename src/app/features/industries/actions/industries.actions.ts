import { createAction, props } from "@ngrx/store";

import { ApiListResponse } from "@app/shared/models/pagination.model";
import { Industry } from "../reducers";

export const loadIndustries = createAction("[Industries] Load");
export const loadIndustriesSuccess = createAction("[Industries] Load Success", props<{ response: ApiListResponse<Industry> }>());
export const loadIndustriesFailure = createAction("[Industries] Load Failure", props<{ error: string }>());

export const updateIndustry = createAction("[Industries] Update", props<{ id: string; changes: Partial<Industry> }>());
export const updateIndustrySuccess = createAction("[Industries] Update Success", props<{ industry: Industry }>());
export const updateIndustryFailure = createAction("[Industries] Update Failure", props<{ error: string }>());
