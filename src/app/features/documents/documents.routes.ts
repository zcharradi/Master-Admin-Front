import { Routes } from '@angular/router';
import { Documents } from './documents'; // adapte le nom du component
import { TranslationComponent } from '../translation/translation';

export const DOCUMENTS_ROUTES: Routes = [
  {
    path: '',
    component: Documents,
  },
  {
    path: 'translation',
    component: TranslationComponent,
    data: { menu: 'dossiers' }
  }
];