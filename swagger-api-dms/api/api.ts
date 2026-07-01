export * from './activities.service';
import { ActivitiesService } from './activities.service';
export * from './article.service';
import { ArticleService } from './article.service';
export * from './department.service';
import { DepartmentService } from './department.service';
export * from './translation.service';
import { TranslationService } from './translation.service';
export const APIS = [ActivitiesService, ArticleService, DepartmentService, TranslationService];
