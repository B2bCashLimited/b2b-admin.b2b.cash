import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {SigninGuard} from './core/guards/signin.guard';
import {AuthGuard} from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: './modules/admin-index/admin-index.module#AdminIndexModule',
    canActivate: [AuthGuard]
  },
  {
    path: 'signin',
    loadChildren: './modules/signin/signin.module#SigninModule',
    canActivate: [SigninGuard]
  },
  {
    path: '**', redirectTo: '/'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
