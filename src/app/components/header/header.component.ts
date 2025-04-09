import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styles: [`
    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      user-select: none;
    }
    
    .logo mat-icon {
      font-size: 24px;
      height: 24px;
      width: 24px;
    }
    
    .logo span {
      font-size: 20px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    
    .spacer {
      flex: 1 1 auto;
    }
    
    .nav-links {
      display: flex;
      gap: 16px;
      margin-right: 16px;
    }
    
    .nav-item {
      padding: 8px 12px;
      border-radius: 4px;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.9);
      text-decoration: none;
      transition: all 0.2s ease;
    }
    
    .nav-item:hover {
      background-color: rgba(255, 255, 255, 0.1);
      color: white;
    }
    
    .nav-item.active {
      background-color: rgba(255, 255, 255, 0.2);
      color: white;
    }
    
    .user-info {
      margin-right: 16px;
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 160px;
    }
    
    .mobile-menu-button {
      display: none;
    }
    
    .mobile-menu {
      position: fixed;
      top: 64px;
      left: 0;
      right: 0;
      background-color: #4154b0;
      display: none;
      flex-direction: column;
      align-items: stretch;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      z-index: 1000;
      transform: translateY(-100%);
      transition: transform 0.3s ease;
    }
    
    .mobile-menu.open {
      display: flex;
      transform: translateY(0);
    }
    
    .mobile-nav {
      display: flex;
      flex-direction: column;
      width: 100%;
    }
    
    .mobile-nav-item {
      padding: 16px;
      display: block;
      color: white;
      text-decoration: none;
      font-weight: 500;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      transition: background-color 0.2s ease;
    }
    
    .mobile-nav-item:hover, .mobile-nav-item.active {
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    @media (max-width: 768px) {
      .nav-links, .user-info {
        display: none;
      }
      
      .mobile-menu-button {
        display: block;
      }
      
      .logo {
        gap: 4px;
      }
      
      .logo span {
        font-size: 18px;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  isAuthenticated$: Observable<boolean>;
  username$: Observable<string | null>;
  isMobileMenuOpen = false;
  
  constructor(private authService: AuthService, private router: Router) {
    this.isAuthenticated$ = this.authService.currentUser$.pipe(
      map(user => !!user)
    );
    this.username$ = this.authService.username$;
  }
  
  ngOnInit(): void {
  }
  
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
  
  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }
  
  logout(): void {
    this.authService.logout();
  }
} 