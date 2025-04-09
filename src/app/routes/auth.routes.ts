import { Routes } from '@angular/router';
import { nonAuthGuard } from '../guards/non-auth.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('../pages/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [nonAuthGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('../pages/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [nonAuthGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
]; 