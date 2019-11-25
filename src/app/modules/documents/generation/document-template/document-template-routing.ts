import { RouterModule, Routes } from '@angular/router';
import { DocumentTemplateComponent } from './document-template.component';

const routes: Routes = [
  {
    path: '',
    component: DocumentTemplateComponent
  }
];

export const DocumentTemplateRouting = RouterModule.forChild(routes);
