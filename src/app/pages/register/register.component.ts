import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }
  
  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ matching: true });
      return { matching: true };
    } else {
      return null;
    }
  }
  
  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    // Extract username and password for the API
    const registerData = {
      username: this.registerForm.value.username,
      password: this.registerForm.value.password
    };
    
    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.isLoading = false;
        // Login automatically after successful registration
        this.authService.login(registerData).subscribe({
          next: () => this.router.navigate(['/dashboard']),
          error: (error) => {
            this.errorMessage = error;
          }
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error;
      }
    });
  }
} 