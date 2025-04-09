import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="footer">
      <div class="footer-content">
        <div class="copyright">
          &copy; {{currentYear}} MindMate - Mental Health Journaling App | Developed by Harsh Mendapara
        </div>
        <div class="links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact Us</a>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background-color: #3f51b5;
      color: white;
      padding: 16px;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      z-index: 100;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1300px;
      margin: 0 auto;
      flex-wrap: wrap;
    }
    
    .copyright {
      font-size: 14px;
      opacity: 0.9;
    }
    
    .links {
      display: flex;
      gap: 24px;
    }
    
    .links a {
      color: white;
      text-decoration: none;
      font-size: 14px;
      opacity: 0.8;
      transition: opacity 0.2s;
    }
    
    .links a:hover {
      opacity: 1;
      text-decoration: underline;
    }
    
    @media (max-width: 768px) {
      .footer-content {
        flex-direction: column;
        gap: 12px;
        text-align: center;
      }
      
      .links {
        gap: 16px;
      }
    }
    
    @media (max-width: 480px) {
      .links {
        flex-direction: column;
        gap: 8px;
      }
    }
  `]
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();
} 