import { industriesFeature } from "./industries.reducer";

export const { selectIndustriesState, selectLoading, selectError, selectPagination, selectAll } = industriesFeature;

export const selectIndustries = selectAll;