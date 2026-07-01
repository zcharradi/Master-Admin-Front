import { Routes } from '@angular/router';
import { Charts } from './charts'; // adapte le nom du component
import { TranslationComponent } from '../translation/translation';

export const CHART_OF_ACCOUNTS_ROUTES: Routes = [
  {
    path: '',
    component: Charts,
  },
  {
    path: 'translation',
    component: TranslationComponent,
    data: { menu: 'comptabilite' }
  }
];