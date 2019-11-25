import { RouterModule, Routes } from '@angular/router';
import { ExportImportComponent } from './export-import.component';

const routes: Routes = [
  {
    path: '',
    component: ExportImportComponent
  }
];

export const ExportImportRouting = RouterModule.forChild(routes);
