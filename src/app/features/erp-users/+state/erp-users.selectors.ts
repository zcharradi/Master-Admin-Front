import { erpUsersFeature } from "./erp-users.reducer";

export const { selectErpUsersState, selectLoading, selectError, selectPagination, selectAll } = erpUsersFeature;

export const selectErpUsers = selectAll;