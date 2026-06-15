export * from './activities.service';
import { ActivitiesService } from './activities.service';
export * from './department.service';
import { DepartmentService } from './department.service';
export const APIS = [ActivitiesService, DepartmentService];
