import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TreeComponent } from './tree.component';
import { MATERIAL_MODULES } from '../material-modules';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MATERIAL_MODULES
  ],
  exports: [
    TreeComponent
  ],
  declarations: [
    TreeComponent
  ],
  entryComponents: [
    TreeComponent
  ]
})
export class TreeModule {
}
