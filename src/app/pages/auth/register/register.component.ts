import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule, 
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  template: `
    <div class="register-container">
      <div class="register-content">
        <div class="app-branding">
          <mat-icon class="app-logo">psychology</mat-icon>
          <h1 class="app-name">MindMate</h1>
        </div>
        
        <mat-card class="register-card">
          <mat-card-header>
            <mat-card-title>Create Account</mat-card-title>
            <mat-card-subtitle>Join MindMate and start journaling today</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Username</mat-label>
                <mat-icon matPrefix>person_outline</mat-icon>
                <input matInput formControlName="username" autocomplete="username">
                <mat-error *ngIf="registerForm.get('username')?.hasError('required')">
                  Username is required
                </mat-error>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Password</mat-label>
                <mat-icon matPrefix>lock_outline</mat-icon>
                <input matInput [type]="hidePassword ? 'password' : 'text'" 
                       formControlName="password" 
                       autocomplete="new-password">
                <button mat-icon-button matSuffix type="button"
                        (click)="hidePassword = !hidePassword">
                  <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                </button>
                <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
                  Password is required
                </mat-error>
                <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
                  Password must be at least 6 characters
                </mat-error>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Confirm Password</mat-label>
                <mat-icon matPrefix>lock_outline</mat-icon>
                <input matInput [type]="hidePassword ? 'password' : 'text'" 
                       formControlName="confirmPassword" 
                       autocomplete="new-password">
                <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">
                  Please confirm your password
                </mat-error>
                <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('passwordMismatch')">
                  Passwords do not match
                </mat-error>
              </mat-form-field>
              
              <div *ngIf="errorMessage" class="error-message">
                <mat-icon>error_outline</mat-icon>
                <span>{{ errorMessage }}</span>
              </div>
              
              <div class="form-actions">
                <button 
                  mat-raised-button 
                  color="primary" 
                  type="submit" 
                  [disabled]="registerForm.invalid || isLoading"
                  class="submit-button"
                >
                  <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
                  <span *ngIf="!isLoading">Create Account</span>
                </button>
              </div>
            </form>
          </mat-card-content>
          
          <mat-card-actions class="register-actions">
            <span>Already have an account?</span>
            <a mat-button color="primary" routerLink="/auth/login">Sign In</a>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      min-height: 100vh;
      overflow-x: hidden;
    }

    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 64px); /* Adjusted to account for header and footer */
      width: 100%;
      margin: 0;
      padding: 40px 0;
      background: linear-gradient(135deg, #3f51b5 0%, #7986cb 100%);
      position: relative;
      overflow-y: auto;
    }
    
    .register-content {
      width: 100%;
      max-width: 400px;
      margin: 0 20px;
      padding-bottom: 40px; /* Added spacing at the bottom */
      animation: fadeInUp 0.5s ease-out;
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .app-branding {
      text-align: center;
      margin-bottom: 32px;
      color: white;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .app-logo {
      width: 64px;
      height: 64px;
      font-size: 64px;
      margin-bottom: 16px;
      animation: pulse 2s infinite;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
    }
    
    @keyframes pulse {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
      100% {
        transform: scale(1);
      }
    }
    
    .app-name {
      font-size: 32px;
      font-weight: 500;
      margin: 0;
      letter-spacing: 1px;
    }
    
    .register-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      padding: 24px;
    }
    
    .register-card mat-card-header {
      margin-bottom: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    
    .register-card mat-card-title {
      font-size: 24px;
      margin-bottom: 8px;
      color: #333;
    }
    
    .register-card mat-card-subtitle {
      font-size: 16px;
      opacity: 0.8;
      margin: 0;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    
    .full-width mat-icon {
      margin-right: 8px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .form-actions {
      display: flex;
      justify-content: center;
      margin-top: 24px;
    }
    
    .submit-button {
      width: 100%;
      padding: 8px;
      font-size: 16px;
      font-weight: 500;
      letter-spacing: 0.5px;
      height: 48px;
      border-radius: 24px;
    }
    
    .submit-button mat-spinner {
      display: inline-block;
      margin-right: 8px;
    }
    
    .error-message {
      display: flex;
      align-items: center;
      color: #f44336;
      margin: 16px 0;
      padding: 12px;
      border-radius: 8px;
      background: rgba(244, 67, 54, 0.1);
    }
    
    .error-message mat-icon {
      margin-right: 8px;
      font-size: 20px;
    }
    
    .register-actions {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid rgba(0, 0, 0, 0.08);
      gap: 8px;
    }
    
    .register-actions span {
      margin-right: 4px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .register-actions a {
      font-weight: 500;
      font-size: 14px;
      text-transform: uppercase;
      white-space: nowrap;
    }
    
    @media (max-width: 480px) {
      .register-container {
        padding: 20px 0 60px 0;
        min-height: calc(100vh - 110px);
      }
      
      .register-content {
        margin: 0 16px;
        padding-bottom: 20px;
      }
      
      .app-logo {
        width: 48px;
        height: 48px;
        font-size: 48px;
      }
      
      .app-name {
        font-size: 28px;
      }
      
      .register-card {
        padding: 20px;
        border-radius: 8px;
      }
      
      .register-card mat-card-header {
        margin-bottom: 20px;
      }
      
      .register-card mat-card-title {
        font-size: 20px;
      }
      
      .register-card mat-card-subtitle {
        font-size: 14px;
      }
      
      .register-actions {
        flex-direction: column;
        padding: 16px 0 8px;
      }
      
      .register-actions span {
        margin-right: 0;
        margin-bottom: 8px;
      }
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  hidePassword = true;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }
  
  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    return password === confirmPassword ? null : { 'passwordMismatch': true };
  }
  
  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    const { username, password } = this.registerForm.value;
    
    this.authService.register({ username, password }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.notificationService.success(response.message || 'Registration successful! Please log in with your credentials.');
          setTimeout(() => {
            this.router.navigate(['/auth/login'], { 
              state: { message: 'Account created successfully. Please log in.' },
              replaceUrl: true
            });
          }, 1500);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Registration failed. Please try again.';
        this.snackBar.open(this.errorMessage, 'Close', {
          duration: 3000
        });
      }
    });
  }
} 