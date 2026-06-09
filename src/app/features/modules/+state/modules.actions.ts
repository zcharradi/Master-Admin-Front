import { createAction, props } from "@ngrx/store";

import { ApiListResponse } from "@app/shared/models/pagination.model";
import { ModuleCatalog } from "./modules.models";

export const loadModules = createAction("[Modules] Load");
export const loadModulesSuccess = createAction("[Modules] Load Success", props<{ response: ApiListResponse<ModuleCatalog> }>());
export const loadModulesFailure = createAction("[Modules] Load Failure", props<{ error: string }>());

export const updateModule = createAction("[Modules] Update", props<{ id: string; changes: Partial<ModuleCatalog> }>());
export const updateModuleSuccess = createAction("[Modules] Update Success", props<{ module: ModuleCatalog }>());