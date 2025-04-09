import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule
  ],
  template: `
    <div class="terms-container">
      <mat-card class="terms-card">
        <mat-card-header>
          <mat-icon mat-card-avatar>gavel</mat-icon>
          <mat-card-title>Terms of Service</mat-card-title>
          <mat-card-subtitle>Last updated: {{ currentDate }}</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="section">
            <h2>Agreement to Terms</h2>
            <p>
              By accessing or using MindMate, you agree to be bound by these Terms of Service. If you disagree 
              with any part of the terms, you may not access the service.
            </p>
          </div>
          
          <mat-divider></mat-divider>
          
          <div class="section">
            <h2>Description of Service</h2>
            <p>
              MindMate is a mental health journaling application that allows users to create, store, and manage 
              their personal journal entries. The service is provided "as is" and "as available" without any 
              warranties of any kind.
            </p>
          </div>
          
          <mat-divider></mat-divider>
          
          <div class="section">
            <h2>User Accounts</h2>
            <p>
              When you create an account with us, you must provide accurate, complete, and current information. 
              Failure to do so constitutes a breach of the Terms, which may result in immediate termination of 
              your account.
            </p>
            <p>
              You are responsible for safeguarding the password that you use to access the service and for any 
              activities or actions under your password.
            </p>
          </div>
          
          <mat-divider></mat-divider>
          
          <div class="section">
            <h2>Intellectual Property</h2>
            <p>
              The service and its original content, features, and functionality are owned by MindMate and are 
              protected by international copyright, trademark, patent, trade secret, and other intellectual 
              property laws.
            </p>
          </div>
          
          <mat-divider></mat-divider>
          
          <div class="section">
            <h2>User Content</h2>
            <p>
              You retain all rights to your journal entries and other content you submit to the service. By 
              submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, 
              modify, adapt, publish, and display such content for the purpose of providing the service.
            </p>
          </div>
          
          <mat-divider></mat-divider>
          
          <div class="section">
            <h2>Termination</h2>
            <p>
              We may terminate or suspend your account immediately, without prior notice or liability, for any 
              reason whatsoever, including without limitation if you breach the Terms.
            </p>
          </div>
          
          <mat-divider></mat-divider>
          
          <div class="section">
            <h2>Limitation of Liability</h2>
            <p>
              In no event shall MindMate, nor its directors, employees, partners, agents, suppliers, or affiliates, 
              be liable for any indirect, incidental, special, consequential or punitive damages, including without 
              limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>
          </div>
          
          <mat-divider></mat-divider>
          
          <div class="section">
            <h2>Changes to Terms</h2>
            <p>
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we 
              will provide at least 30 days' notice prior to any new terms taking effect.
            </p>
          </div>
          
          <mat-divider></mat-divider>
          
          <div class="section">
            <h2>Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at 
              <a href="mailto:harsh351998&#64;gmail.com">harsh351998&#64;gmail.com</a>.
            </p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .terms-container {
      display: flex;
      justify-content: center;
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .terms-card {
      width: 100%;
      max-width: 800px;
      margin-bottom: 24px;
    }
    
    .section {
      margin: 24px 0;
    }
    
    h2 {
      color: #3f51b5;
      margin-bottom: 16px;
      font-weight: 500;
    }
    
    p {
      line-height: 1.6;
      margin-bottom: 16px;
    }
    
    a {
      color: #3f51b5;
      text-decoration: none;
    }
    
    a:hover {
      text-decoration: underline;
    }
    
    mat-divider {
      margin: 24px 0;
    }
    
    @media (max-width: 768px) {
      .terms-container {
        padding: 16px;
      }
      
      .section {
        margin: 20px 0;
      }
      
      h2 {
        font-size: 1.3rem;
      }
    }
  `]
})
export class TermsComponent {
  currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
} 