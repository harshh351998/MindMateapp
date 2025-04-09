import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const nonAuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAuthenticated()) {
    // User is already authenticated, redirect to dashboard
    router.navigateByUrl('/dashboard');
    return false;
  }
  
  return true;
}; 