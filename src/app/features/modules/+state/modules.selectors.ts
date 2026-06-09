import { modulesFeature } from "./modules.reducer";

export const { selectModulesState, selectLoading, selectError, selectPagination, selectAll } = modulesFeature;

export const selectModules = selectAll;