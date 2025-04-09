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

@Component({
  selector: 'app-login',
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
    <div class="login-container">
      <div class="login-content">
        <div class="app-branding">
          <mat-icon class="app-logo">psychology</mat-icon>
          <h1 class="app-name">MindMate</h1>
        </div>
        
        <mat-card class="login-card">
          <mat-card-header>
            <mat-card-title>Welcome Back</mat-card-title>
            <mat-card-subtitle>Sign in to continue to MindMate</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Username</mat-label>
                <mat-icon matPrefix>person_outline</mat-icon>
                <input matInput formControlName="username" autocomplete="username">
                <mat-error *ngIf="loginForm.get('username')?.hasError('required')">
                  Username is required
                </mat-error>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Password</mat-label>
                <mat-icon matPrefix>lock_outline</mat-icon>
                <input matInput [type]="hidePassword ? 'password' : 'text'" 
                       formControlName="password" 
                       autocomplete="current-password">
                <button mat-icon-button matSuffix type="button"
                        (click)="hidePassword = !hidePassword">
                  <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                </button>
                <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                  Password is required
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
                  [disabled]="loginForm.invalid || isLoading"
                  class="submit-button"
                >
                  <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
                  <span *ngIf="!isLoading">Sign In</span>
                </button>
              </div>
            </form>
          </mat-card-content>
          
          <mat-card-actions class="login-actions">
            <span>Don't have an account?</span>
            <a mat-button color="primary" routerLink="/auth/register">Create Account</a>
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

    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 60px); /* Adjusted to account for footer */
      width: 100%;
      margin: 0;
      padding: 40px 0;
      background: linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%);
      position: relative;
      overflow-y: auto;
    }
    
    .login-content {
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
    
    .login-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      padding: 24px;
      margin: 0;
    }
    
    .login-card mat-card-header {
      margin-bottom: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    
    .login-card mat-card-title {
      font-size: 24px;
      margin-bottom: 8px;
      color: #333;
    }
    
    .login-card mat-card-subtitle {
      font-size: 16px;
      opacity: 0.8;
      margin: 0;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    
    .mat-mdc-form-field-subscript-wrapper {
      padding: 0;
    }
    
    .full-width mat-icon {
      margin-right: 8px;
      color: rgba(0, 0, 0, 0.6);
    }

    .full-width input {
      padding: 8px 0;
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
    
    .login-actions {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid rgba(0, 0, 0, 0.08);
      gap: 8px;
    }
    
    .login-actions span {
      margin-right: 4px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .login-actions a {
      font-weight: 500;
      font-size: 14px;
      text-transform: uppercase;
      white-space: nowrap;
    }
    
    @media (max-width: 480px) {
      .login-container {
        padding: 20px 0;
        min-height: calc(100vh - 80px);
      }
      
      .login-content {
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
      
      .login-card {
        padding: 20px;
        border-radius: 8px;
      }
      
      .login-card mat-card-header {
        margin-bottom: 20px;
      }
      
      .login-card mat-card-title {
        font-size: 20px;
      }
      
      .login-card mat-card-subtitle {
        font-size: 14px;
      }
      
      .login-actions {
        flex-direction: column;
        padding: 16px 0 8px;
      }
      
      .login-actions span {
        margin-right: 0;
        margin-bottom: 8px;
      }
    }
    
    /* Fix for Material form field appearance */
    ::ng-deep {
      .mat-mdc-form-field-flex {
        background-color: rgba(255, 255, 255, 0.9) !important;
      }

      .mat-mdc-text-field-wrapper {
        background-color: transparent !important;
      }

      .mat-mdc-form-field-focus-overlay {
        background-color: transparent !important;
      }
      
      .mat-mdc-button {
        padding: 0 16px !important;
        height: 36px !important;
        line-height: 36px !important;
      }
      
      .mat-mdc-card-header-text {
        margin: 0 !important;
        text-align: center !important;
        width: 100% !important;
      }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  hidePassword = true;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }
  
  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Login failed. Please check your credentials.';
      }
    });
  }
} 