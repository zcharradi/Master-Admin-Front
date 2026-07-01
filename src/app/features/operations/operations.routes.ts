import { Routes } from '@angular/router';

import { Operations } from './operations';
import { TranslationComponent } from '../translation/translation';

export const OPERATION_ROUTES: Routes = [
  {
    path: '',
    component: Operations,
  },
  {
    path: 'translation',
    component: TranslationComponent,
    data: { menu: 'operations' }
  }
];
