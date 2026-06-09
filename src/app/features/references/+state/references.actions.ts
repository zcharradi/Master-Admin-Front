import { createAction, props } from "@ngrx/store";

import { ReferenceData } from "./references.models";

export const loadReferences = createAction("[References] Load");
export const loadReferencesSuccess = createAction("[References] Load Success", props<{ data: ReferenceData }>());
export const loadReferencesFailure = createAction("[References] Load Failure", props<{ error: string }>());