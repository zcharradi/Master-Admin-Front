import { createInitialListState, createListAdapter, ListState } from "@app/shared/state/entity-state";

export interface MasterAdmin {
  id: string;
  email: string;
  fullName?: string;
  hasMfa?: boolean;
  isBlocked?: boolean;
  roles?: string[];
}

export type MasterAdminsState = ListState<MasterAdmin>;

export const masterAdminsAdapter = createListAdapter<MasterAdmin>((admin) => admin.id);
export const initialMasterAdminsState: MasterAdminsState = {
  ...createInitialListState(masterAdminsAdapter),
};