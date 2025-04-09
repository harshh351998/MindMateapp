import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { JournalListComponent } from './pages/journal-list/journal-list.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { JournalFormComponent } from './pages/journal-form/journal-form.component';
import { JournalDetailComponent } from './pages/journal-detail/journal-detail.component';

export const routes: Routes = [
  // Authentication routes
  {
    path: 'auth',
    loadChildren: () => import('./routes/auth.routes').then(m => m.AUTH_ROUTES)
  },
  
  // Protected routes - User dashboard and profile
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  
  // Journal routes (protected)
  {
    path: 'journal',
    canActivate: [authGuard],
    children: [
      {
        path: 'list',
        component: JournalListComponent
      },
      {
        path: 'new',
        component: JournalFormComponent
      },
      {
        path: ':id',
        component: JournalDetailComponent
      },
      {
        path: ':id/edit',
        component: JournalFormComponent
      },
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      }
    ]
  },
  
  // Default route - Redirect to the dashboard if authenticated
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  
  // 404 Page
  {
    path: '**',
    component: NotFoundComponent
  }
]; 