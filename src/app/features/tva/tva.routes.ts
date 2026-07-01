import { Routes } from '@angular/router';
import { Tva } from './tva';
import { TranslationComponent } from '../translation/translation';
export const TVA_ROUTES: Routes = [
  {
      path: '',
      component: Tva,
    },
    {
      path: 'translation',
      component: TranslationComponent,
      data: { menu: 'vat' }
    }
  
  ];