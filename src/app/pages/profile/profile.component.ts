import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="profile-container">
      <h1>Account Settings</h1>
      
      <mat-card class="profile-card">
        <mat-card-header>
          <mat-icon mat-card-avatar>person</mat-icon>
          <mat-card-title>Profile Information</mat-card-title>
          <mat-card-subtitle>Manage your account details</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <h3>Your Information</h3>
          
          <dl class="info-list">
            <dt>Username</dt>
            <dd>{{ username }}</dd>
            
            <dt>Account Created</dt>
            <dd>April 2025</dd>
          </dl>
          
          <mat-divider class="my-4"></mat-divider>
          
          <h3>Change Password</h3>
          
          <form [formGroup]="passwordForm" (ngSubmit)="onSubmit()">
            <mat-form-field class="full-width">
              <mat-label>Current Password</mat-label>
              <input matInput type="password" formControlName="currentPassword">
              <mat-error *ngIf="passwordForm.controls['currentPassword'].hasError('required')">
                Current password is required
              </mat-error>
            </mat-form-field>
            
            <mat-form-field class="full-width">
              <mat-label>New Password</mat-label>
              <input matInput type="password" formControlName="newPassword">
              <mat-error *ngIf="passwordForm.controls['newPassword'].hasError('required')">
                New password is required
              </mat-error>
              <mat-error *ngIf="passwordForm.controls['newPassword'].hasError('minlength')">
                Password must be at least 6 characters
              </mat-error>
            </mat-form-field>
            
            <mat-form-field class="full-width">
              <mat-label>Confirm New Password</mat-label>
              <input matInput type="password" formControlName="confirmPassword">
              <mat-error *ngIf="passwordForm.controls['confirmPassword'].hasError('required')">
                Please confirm your new password
              </mat-error>
              <mat-error *ngIf="passwordForm.controls['confirmPassword'].hasError('matching')">
                Passwords do not match
              </mat-error>
            </mat-form-field>
            
            <div *ngIf="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>
            
            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="passwordForm.invalid || isLoading">
                <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
                <span *ngIf="!isLoading">Update Password</span>
              </button>
            </div>
          </form>
          
          <mat-divider class="my-4"></mat-divider>
          
          <h3>Account Actions</h3>
          
          <div class="account-actions">
            <button mat-raised-button color="warn" (click)="logout()">
              <mat-icon>exit_to_app</mat-icon>
              Logout
            </button>
            
            <button mat-button color="warn" (click)="confirmDeleteAccount()">
              <mat-icon>delete_forever</mat-icon>
              Delete Account
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
      animation: fadeIn 0.4s ease-in-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    h1 {
      margin-bottom: 24px;
      color: #3f51b5;
      font-size: 28px;
      font-weight: 500;
    }
    
    h3 {
      margin-top: 0;
      margin-bottom: 16px;
      color: #3f51b5;
      font-size: 20px;
      font-weight: 500;
    }
    
    .profile-card {
      margin-bottom: 24px;
      transition: box-shadow 0.3s ease;
      
      &:hover {
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      }
    }
    
    .info-list {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 12px 16px;
      margin: 0 0 24px 0;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }
    
    dt {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.6);
    }
    
    dd {
      margin: 0;
      font-weight: 400;
    }
    
    .my-4 {
      margin: 32px 0;
    }
    
    .account-actions {
      display: flex;
      gap: 16px;
      margin-top: 24px;
      flex-wrap: wrap;
    }
    
    .form-actions {
      margin-top: 24px;
    }
    
    .full-width {
      width: 100%;
    }
    
    .error-message {
      color: #f44336;
      margin: 16px 0;
      padding: 12px;
      background-color: #ffebee;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
    }
    
    @media (max-width: 768px) {
      h1 {
        font-size: 24px;
      }
      
      h3 {
        font-size: 18px;
      }
      
      .account-actions {
        flex-direction: column;
        gap: 12px;
      }
      
      .info-list {
        grid-template-columns: 1fr;
        gap: 8px;
      }
      
      dt {
        font-weight: 600;
        border-bottom: 1px solid rgba(0,0,0,0.1);
        padding-bottom: 4px;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  passwordForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  username = '';
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }
  
  ngOnInit(): void {
    // Get username from auth service
    this.authService.username$.subscribe(username => {
      if (username) {
        this.username = username;
      }
    });
  }
  
  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('newPassword')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ matching: true });
      return { matching: true };
    } else {
      return null;
    }
  }
  
  onSubmit(): void {
    if (this.passwordForm.invalid) {
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    const currentPassword = this.passwordForm.get('currentPassword')?.value;
    const newPassword = this.passwordForm.get('newPassword')?.value;
    
    this.authService.changePassword(currentPassword, newPassword)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.notificationService.success('Your password has been updated successfully');
          this.passwordForm.reset();
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.error || 'Failed to update password. Please try again.';
          console.error('Password change error:', error);
          this.notificationService.error(this.errorMessage);
        }
      });
  }
  
  logout(): void {
    this.authService.logout();
    this.notificationService.info('You have been logged out', 'Goodbye');
  }
  
  confirmDeleteAccount(): void {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Here you would connect to a user service to delete the account
      // For now, we'll just simulate and log out
      this.notificationService.success('Account deleted successfully');
      this.authService.logout();
    }
  }
} 