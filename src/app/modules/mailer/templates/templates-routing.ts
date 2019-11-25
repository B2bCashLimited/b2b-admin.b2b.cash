import {Routes, RouterModule} from '@angular/router';
import {TemplatesComponent} from './templates.component';

const routes: Routes = [
  {
    path: '',
    component: TemplatesComponent,
    children: [
      {
        path: '',
        loadChildren: './templates-index/templates-index.module#TemplatesIndexModule'
      },
      {
        path: 'edit/:templateId',
        loadChildren: './templates-edit/templates-edit.module#TemplatesEditModule'
      },
      {
        path: 'edit',
        redirectTo: ''
      },
      {
        path: 'new',
        loadChildren: './templates-new/templates-new.module#TemplatesNewModule'
      },
    ]
  }
];

export const TEMPLATES_ROUTING = RouterModule.forChild(routes);
