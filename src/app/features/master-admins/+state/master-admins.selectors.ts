import { masterAdminsFeature } from "./master-admins.reducer";

export const { selectMasterAdminsState, selectLoading, selectError, selectPagination, selectAll } = masterAdminsFeature;

export const selectMasterAdmins = selectAll;