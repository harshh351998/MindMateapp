import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';

// Services
import { AuthService } from '../services/auth.service';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    AuthService
  ]
})
export class CoreModule {
  // Prevent reimporting this module
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule has already been loaded. Import only in AppModule.');
    }
  }
} 