import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChoiceOfLanguageComponent } from './choice-of-language.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    ChoiceOfLanguageComponent
  ],
  entryComponents: [],
  exports: [
    ChoiceOfLanguageComponent
  ]
})
export class ChoiceOfLanguageModule {
}
