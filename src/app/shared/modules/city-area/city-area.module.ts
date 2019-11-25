import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CityAreaComponent } from './city-area.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MATERIAL_MODULES } from '../material-modules';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ...MATERIAL_MODULES
  ],
  declarations: [CityAreaComponent],
  exports: [CityAreaComponent]
})
export class CityAreaModule { }
