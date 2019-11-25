import { RouterModule, Routes } from '@angular/router';
import { GenerationComponent } from './generation.component';

const routes: Routes = [
  {
    path: '',
    component: GenerationComponent
  },
  {
    path: 'new-act',
    loadChildren: './document-template/document-template.module#DocumentTemplateModule'
  },
  {
    path: 'new-invoice',
    loadChildren: './document-template/document-template.module#DocumentTemplateModule'
  },
  {
    path: ':id',
    loadChildren: './document-template/document-template.module#DocumentTemplateModule'
  },
];

export const GenerationRouting = RouterModule.forChild(routes);
