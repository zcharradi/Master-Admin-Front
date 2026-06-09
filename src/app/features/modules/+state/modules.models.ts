import { createInitialListState, createListAdapter, ListState } from "@app/shared/state/entity-state";

export interface ModuleCatalog {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  maxAgencies?: number;
}

export type ModulesState = ListState<ModuleCatalog>;

export const modulesAdapter = createListAdapter<ModuleCatalog>((module) => module.id);
export const initialModulesState: ModulesState = {
  ...createInitialListState(modulesAdapter),
};