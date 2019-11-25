import { Routes, RouterModule } from '@angular/router';
import { DocumentsComponent } from './documents.component';

const routes: Routes = [
  {
    path: '',
    component: DocumentsComponent,
    children: [
      {
        path: '',
        redirectTo: 'requisites-settings'
      },
      {
        path: 'requisites-settings',
        loadChildren: './requisites-settings/requisites-settings.module#RequisitesSettingsModule'
      },
      {
        path: 'list',
        loadChildren: './list/list.module#ListModule'
      },
      {
        path: 'generation',
        loadChildren: './generation/generation.module#GenerationModule'
      },
      {
        path: 'export-import',
        loadChildren: './export-import/export-import.module#ExportImportModule'
      },
    ]
  }
];

export const DocumentsRouting = RouterModule.forChild(routes);
