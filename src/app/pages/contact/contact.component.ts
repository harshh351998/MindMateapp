import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="contact-container">
      <mat-card class="contact-card">
        <mat-card-header>
          <mat-icon mat-card-avatar>contact_support</mat-icon>
          <mat-card-title>Contact Us</mat-card-title>
          <mat-card-subtitle>We'd love to hear from you</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="contact-info">
            <div class="info-item">
              <mat-icon>email</mat-icon>
              <div>
                <h3>Email</h3>
                <p><a href="mailto:harsh351998&#64;gmail.com">harsh351998&#64;gmail.com</a></p>
              </div>
            </div>
            
            <div class="info-item">
              <mat-icon>location_on</mat-icon>
              <div>
                <h3>Address</h3>
                <p>Palghar, Maharashtra, India</p>
              </div>
            </div>
          </div>
          
          <div class="contact-options">
            <h2>How to reach us</h2>
            
            <div class="option-card">
              <mat-icon>mail</mat-icon>
              <div class="option-content">
                <h3>Email Us</h3>
                <p>Send us an email directly using your preferred email client.</p>
                <a mat-raised-button color="primary" href="mailto:harsh351998&#64;gmail.com">
                  <mat-icon>send</mat-icon>
                  Send Email
                </a>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .contact-container {
      display: flex;
      justify-content: center;
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .contact-card {
      width: 100%;
      max-width: 800px;
      margin-bottom: 24px;
    }
    
    .contact-info {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
      margin-bottom: 32px;
    }
    
    .info-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      flex: 1;
      min-width: 250px;
    }
    
    .info-item mat-icon {
      color: #3f51b5;
      font-size: 24px;
      width: 24px;
      height: 24px;
      margin-top: 4px;
    }
    
    .info-item h3 {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }
    
    .info-item p {
      margin: 0;
      line-height: 1.5;
      color: #666;
    }
    
    .info-item a {
      color: #3f51b5;
      text-decoration: none;
    }
    
    .info-item a:hover {
      text-decoration: underline;
    }
    
    .contact-options {
      margin-top: 32px;
    }
    
    .contact-options h2 {
      color: #3f51b5;
      margin-bottom: 24px;
      font-weight: 500;
    }
    
    .option-card {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 20px;
      background-color: #f5f5f5;
      border-radius: 8px;
      margin-bottom: 16px;
    }
    
    .option-card mat-icon {
      color: #3f51b5;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }
    
    .option-content {
      flex: 1;
    }
    
    .option-content h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 500;
      color: #333;
    }
    
    .option-content p {
      margin: 0 0 16px 0;
      line-height: 1.5;
      color: #666;
    }
    
    .option-content a {
      margin-top: 8px;
    }
    
    .option-content mat-icon {
      margin-right: 8px;
    }
    
    @media (max-width: 768px) {
      .contact-container {
        padding: 16px;
      }
      
      .contact-info {
        flex-direction: column;
        gap: 20px;
      }
      
      .info-item {
        min-width: 100%;
      }
      
      .contact-options h2 {
        font-size: 1.3rem;
      }
      
      .option-card {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
      
      .option-content a {
        margin: 0 auto;
      }
    }
  `]
})
export class ContactComponent {
  // No form handling needed anymore
} 