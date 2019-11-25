import {NgModule} from '@angular/core';
import {LISTS_ROUTING} from './lists-routing';
import {ListsComponent} from './lists.component';
import {SharedModule} from '@b2b/shared/shared.module';
import {SendGroupItemComponent} from './components/send-group-item/send-group-item.component';

@NgModule({
  imports: [
    SharedModule,
    LISTS_ROUTING
  ],
  exports: [
    SendGroupItemComponent,
  ],
  declarations: [
    ListsComponent,
    SendGroupItemComponent,
  ],
})
export class ListsModule {
}
