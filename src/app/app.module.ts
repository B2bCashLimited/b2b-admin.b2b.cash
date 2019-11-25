// Modules
import {AppRoutingModule} from './app-routing.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';
import {ServiceWorkerModule} from '@angular/service-worker';

// Components
import {AppComponent} from './app.component';

// Others
import {environment} from '../environments/environment';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {TokenInterceptorService} from '@b2b/services/token-interceptor.service';
import {CacheInterceptorService} from '@b2b/services/cache-interceptor.service';
import {SharedModule} from '@b2b/shared/shared.module';
import {NgxPermissionsModule} from 'ngx-permissions';
import {GlobalErrorHandler} from '@b2b/services/global-error-handler';
import {ToastrModule} from 'ngx-toastr';
import { ColorPickerModule } from 'ngx-color-picker';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production}),
    BrowserAnimationsModule,
    NgxPermissionsModule.forRoot(),
    HttpClientModule,
    SharedModule,
    ToastrModule.forRoot({
      timeOut: 3000,
    }),
    ColorPickerModule
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: TokenInterceptorService, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: CacheInterceptorService, multi: true},
    // {provide: ErrorHandler, useClass: GlobalErrorHandler},
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {
}
