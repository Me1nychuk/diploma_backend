export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
}

export interface PaginatedResponse<T> {
  data: T[];
  totalQuantity: number;
  totalPages: number;
  page: number;
}
