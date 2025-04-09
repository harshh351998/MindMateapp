import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule
  ],
  template: `
    <div class="privacy-container">
      <mat-card class="privacy-card">
        <mat-card-header>
          <mat-icon mat-card-avatar>privacy_tip</mat-icon>
          <mat-card-title>Privacy Policy</mat-card-title>
          <mat-card-subtitle>Last updated: {{ currentDate }}</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="section">
            <h2>Introduction</h2>
            <p>
              At MindMate, we take your privacy seriously. This Privacy Policy explains how we collect, use, 
              disclose, and safeguard your information when you use our mental health journaling application.
            </p>
          </div>
          
          <mat-divider></mat-divider>
          
          <div class="section">
            <h2>Information We Collect</h2>
            <p>We collect information that you provide directly to us, including:</p>
            <ul>
              <li>Account information (username, password)</li>
              <li>Journal entries and content you create</li>
              <li>Profile information you choose to provide</li>
              <li>Communications with us</li>
            </ul>
          </div>
          
          <mat-divider></mat-divider>
          
          <div class="section">
            <h2>How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Process your transactions</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Monitor and analyze trends and usage</li>
            </ul>
          </div>
          
          <mat-divider></mat-divider>
          
          <div class="section">
            <h2>Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission 
              over the Internet or electronic storage is 100% secure.
            </p>
          </div>
          
          <mat-divider></mat-divider>
          
          <div class="section">
            <h2>Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Data portability</li>
            </ul>
          </div>
          
          <mat-divider></mat-divider>
          
          <div class="section">
            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at 
              <a href="mailto:harsh351998&#64;gmail.com">harsh351998&#64;gmail.com</a>.
            </p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .privacy-container {
      display: flex;
      justify-content: center;
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .privacy-card {
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
    
    ul {
      padding-left: 24px;
      margin-bottom: 16px;
    }
    
    li {
      margin-bottom: 8px;
      line-height: 1.5;
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
      .privacy-container {
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
export class PrivacyComponent {
  currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
} 