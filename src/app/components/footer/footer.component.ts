import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="footer" [class.auth-footer]="isAuthPage()">
      <div class="footer-content">
        <div class="copyright">
          &copy; {{currentYear}} MindMate - Mental Health Journaling App
        </div>
        <div class="developer">
          Developed by Harsh Mendapara
        </div>
        <div class="links">
          <a href="#" routerLink="/privacy">Privacy Policy</a>
          <a href="#" routerLink="/terms">Terms of Service</a>
          <a href="#" routerLink="/contact">Contact Us</a>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background-color: #3f51b5;
      color: white;
      padding: 16px 0;
      width: 100%;
      z-index: 100;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .auth-footer {
      background-color: rgba(63, 81, 181, 0.9);
      padding: 12px 0;
      position: relative;
    }
    
    .footer-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      max-width: 1300px;
      margin: 0 auto;
      flex-wrap: wrap;
      padding: 0 24px;
      gap: 10px;
    }
    
    .copyright {
      font-size: 14px;
      opacity: 0.9;
    }
    
    .developer {
      font-size: 13px;
      opacity: 0.8;
      margin-bottom: 5px;
    }
    
    .links {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      justify-content: center;
    }
    
    .links a {
      color: white;
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.2s ease;
      position: relative;
      padding: 4px 0;
    }
    
    .links a:hover {
      color: #ff4081;
    }
    
    .links a::after {
      content: '';
      position: absolute;
      width: 100%;
      height: 2px;
      bottom: 0;
      left: 0;
      background-color: #ff4081;
      transform: scaleX(0);
      transform-origin: bottom right;
      transition: transform 0.3s;
    }
    
    .links a:hover::after {
      transform: scaleX(1);
      transform-origin: bottom left;
    }
    
    @media (min-width: 769px) {
      .footer-content {
        flex-direction: row;
        justify-content: space-between;
        text-align: left;
        gap: 16px;
      }
      
      .copyright, .developer {
        margin-bottom: 0;
      }
      
      .developer {
        order: 2;
      }
      
      .links {
        order: 3;
      }
    }
    
    @media (max-width: 480px) {
      .footer {
        padding: 12px 0;
      }
      
      .auth-footer {
        padding: 10px 0;
      }
      
      .links {
        gap: 14px;
      }
      
      .links a {
        font-size: 12px;
      }
      
      .copyright, .developer {
        font-size: 12px;
      }
    }
  `]
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();
  
  constructor(private router: Router) {}
  
  isAuthPage(): boolean {
    const currentUrl = this.router.url;
    return currentUrl.includes('/auth/login') || currentUrl.includes('/auth/register');
  }
} 