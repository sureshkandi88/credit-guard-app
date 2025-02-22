import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './shared/header/header.component';
import { AuthService } from './services/auth.service';
import { Observable } from 'rxjs';
import { UserProfile } from './models/auth.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule, 
    HeaderComponent,
    CommonModule  
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'credit-guard-app';
  isLoggedIn$: Observable<UserProfile | null>;

  constructor(private authService: AuthService) {
    this.isLoggedIn$ = this.authService.currentUser$;
  }

  ngOnInit() {
    // Optional: You can add additional logic here if needed
  }
}
