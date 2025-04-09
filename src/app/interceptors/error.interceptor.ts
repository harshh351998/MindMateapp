import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // For 401 errors, clear token and redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('username');
        router.navigateByUrl('/login');
      }
      
      // Get error message from the API response or fallback to default message
      const errorMessage = error.error?.message || 
                          error.error?.title || 
                          error.message ||
                          'An unknown error occurred';

      // Let the component handle the specific error
      return throwError(() => ({
        status: error.status,
        message: errorMessage,
        error: error.error
      }));
    })
  );
}; 