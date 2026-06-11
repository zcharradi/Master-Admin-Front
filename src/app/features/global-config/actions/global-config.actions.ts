import { createAction, props } from "@ngrx/store";

import { GlobalConfig } from "../reducers";

export const loadAllConfigs = createAction("[Global Config] Load All");
export const loadAllConfigsSuccess = createAction("[Global Config] Load All Success", props<{ configs: GlobalConfig[] }>());
export const loadAllConfigsFailure = createAction("[Global Config] Load All Failure", props<{ error: string }>());

export const selectConfigById = createAction("[Global Config] Select", props<{ id: number }>());
export const clearSelection = createAction("[Global Config] Clear Selection");

export const updateGlobalConfig = createAction("[Global Config] Update", props<{ id: number; payload: Partial<GlobalConfig> }>());
export const updateGlobalConfigSuccess = createAction("[Global Config] Update Success", props<{ config: GlobalConfig }>());
export const updateGlobalConfigFailure = createAction("[Global Config] Update Failure", props<{ error: string }>());

export const updateGlobalSecret = createAction("[Global Config] Update Secret", props<{ id: number; payload: Partial<GlobalConfig> }>());
export const updateGlobalSecretSuccess = createAction("[Global Config] Update Secret Success");
