import { createInitialListState, createListAdapter, ListState } from "@app/shared/state/entity-state";

export interface DbInstance {
  id: string;
  name: string;
  host: string;
  port: number;
  dbName: string;
  server?: string;
  isActive: boolean;
  tenantCount?: number;
}

export type DbInstancesState = ListState<DbInstance>;

export const dbInstancesAdapter = createListAdapter<DbInstance>((instance) => instance.id);
export const initialDbInstancesState: DbInstancesState = {
  ...createInitialListState(dbInstancesAdapter),
};