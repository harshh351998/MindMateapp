import { Component, ViewChild, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterModule, NavigationEnd, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MediaMatcher } from '@angular/cdk/layout';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from './services/auth.service';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <app-header (toggleSidenav)="sidenav?.toggle()" [isMobile]="mobileQuery.matches"></app-header>
      
      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav #sidenav [mode]="'over'" 
                    [opened]="false" 
                    [fixedInViewport]="mobileQuery.matches"
                    [fixedTopGap]="mobileQuery.matches ? 56 : 64"
                    [disableClose]="false"
                    (closed)="closeSidenav()"
                    class="app-sidenav">
          <app-sidenav *ngIf="isAuthenticated"></app-sidenav>
        </mat-sidenav>
        
        <mat-sidenav-content>
          <div class="content-area" [class.authenticated]="isAuthenticated" [class.auth-page]="isAuthPage">
            <router-outlet></router-outlet>
          </div>
          <app-footer></app-footer>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      height: 100%;
    }
    
    .sidenav-container {
      flex: 1;
      min-height: 100%;
    }
    
    .app-sidenav {
      min-width: 250px;
      border-right: 1px solid rgba(0, 0, 0, 0.12);
      background-color: #f5f5f5;
    }
    
    .content-area {
      padding: 20px;
      min-height: calc(100vh - 64px - 64px);
      background-color: #fafafa;
    }
    
    .content-area.authenticated {
      padding: 20px;
    }
    
    .content-area.auth-page {
      padding: 0;
      min-height: calc(100vh - 64px);
    }
    
    @media (max-width: 768px) {
      .content-area {
        padding: 16px;
        min-height: calc(100vh - 56px - 90px);
      }
      
      .content-area.authenticated {
        padding: 16px;
      }
      
      .content-area.auth-page {
        padding: 0;
        min-height: calc(100vh - 146px);
      }
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'MindMate';
  mobileQuery: MediaQueryList;
  isAuthenticated = false;
  isAuthPage = false;
  @ViewChild('sidenav') sidenav: MatSidenav | undefined;
  
  private _mobileQueryListener: () => void;
  private authSubscription: Subscription | undefined;
  private routerSubscription: Subscription | undefined;
  
  constructor(
    private media: MediaMatcher,
    private changeDetectorRef: ChangeDetectorRef,
    private authService: AuthService,
    private router: Router
  ) {
    this.mobileQuery = this.media.matchMedia('(max-width: 768px)');
    this._mobileQueryListener = () => this.changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);
  }
  
  ngOnInit() {
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
      
      // Auto close the sidenav in mobile view when user logs out
      if (!this.isAuthenticated && this.mobileQuery.matches && this.sidenav?.opened) {
        this.sidenav.close();
      }
      
      this.changeDetectorRef.detectChanges();
    });
    
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.url;
        this.isAuthPage = url.includes('/auth/login') || url.includes('/auth/register');
        
        // Close sidenav on mobile when navigating
        if (this.mobileQuery.matches && this.sidenav?.opened) {
          this.sidenav.close();
        }
        
        this.changeDetectorRef.detectChanges();
      });
  }
  
  ngOnDestroy() {
    this.mobileQuery.removeEventListener('change', this._mobileQueryListener);
    
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
  
  closeSidenav() {
    if (this.sidenav) {
      this.sidenav.close();
    }
  }
} 