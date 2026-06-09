export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

export const defaultPagination: Pagination = {
  page: 1,
  pageSize: 10,
  total: 0,
};

export interface ApiListResponse<T> {
  data: T[];
  total: number;
}
