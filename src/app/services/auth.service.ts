import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { 
  AuthResponseDto, 
  LoginRequestDto, 
  RegisterRequestDto, 
  User 
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.url || environment.apiUrl}/api/auth`;
  private tokenKey = 'auth_token';
  private userIdKey = 'user_id';
  private usernameKey = 'username';
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  
  username$ = this.currentUser$.pipe(
    map(user => user?.username || null)
  );

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check if user is already logged in
    const userId = this.getUserId();
    const username = this.getUsername();
    
    if (userId && username) {
      this.currentUserSubject.next({
        id: userId,
        username: username
      });
    }
  }

  // Login user
  login(loginData: {username: string, password: string}): Observable<any> {
    // Mock login for development
    return of({
      id: '1',
      username: loginData.username,
      token: 'mock-jwt-token'
    }).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  // Register user
  register(userData: {username: string, password: string}): Observable<any> {
    // Mock registration - don't log in the user automatically
    return of({
      id: '2',
      username: userData.username,
      success: true,
      message: 'Registration successful'
    });
  }

  // Process authentication response
  private handleAuthResponse(response: any): void {
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.userIdKey, response.id);
    localStorage.setItem(this.usernameKey, response.username);
    
    this.currentUserSubject.next({
      id: response.id,
      username: response.username
    });
  }

  // Logout
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userIdKey);
    localStorage.removeItem(this.usernameKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Get authentication token
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Get user ID
  getUserId(): string | null {
    return localStorage.getItem(this.userIdKey);
  }

  // Get username
  getUsername(): string | null {
    return localStorage.getItem(this.usernameKey);
  }

  // Get user profile data
  getUserProfile(): Observable<User> {
    const userId = this.getUserId();
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }
    
    // Return mock profile data
    return of({
      id: userId,
      username: this.getUsername() || 'User',
      email: 'user@example.com',
      firstName: 'Demo',
      lastName: 'User',
      joinDate: new Date()
    });
  }

  // Change password
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    const userId = this.getUserId();
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }
    
    // Mock password change
    return of({ success: true, message: 'Password changed successfully' });
  }

  // Delete account
  deleteAccount(password: string): Observable<any> {
    const userId = this.getUserId();
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }
    
    // Mock account deletion
    return of({ success: true }).pipe(
      tap(() => this.logout())
    );
  }

  // Error handling
  private handleError(message: string, error: any): Observable<never> {
    console.error(message, error);
    return throwError(() => error);
  }
} 