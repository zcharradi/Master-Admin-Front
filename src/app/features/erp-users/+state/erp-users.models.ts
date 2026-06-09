import { createInitialListState, createListAdapter, ListState } from "@app/shared/state/entity-state";

export interface ErpUser {
  id: string;
  email: string;
  fullName?: string;
  isActive: boolean;
  isBlocked: boolean;
  resetPasswordIsNeeded?: boolean;
  tenantIds?: string[];
}

export type ErpUsersState = ListState<ErpUser>;

export const erpUsersAdapter = createListAdapter<ErpUser>((user) => user.id);
export const initialErpUsersState: ErpUsersState = {
  ...createInitialListState(erpUsersAdapter),
};