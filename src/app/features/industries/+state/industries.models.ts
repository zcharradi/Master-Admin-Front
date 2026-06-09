import { createInitialListState, createListAdapter, ListState } from "@app/shared/state/entity-state";

export interface Industry {
  id: string;
  code: string;
  label: string;
  isActive: boolean;
}

export type IndustriesState = ListState<Industry>;

export const industriesAdapter = createListAdapter<Industry>((industry) => industry.id);
export const initialIndustriesState: IndustriesState = {
  ...createInitialListState(industriesAdapter),
};