import { Component } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HeaderComponent } from '../shared/header/header.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterModule, HeaderComponent]
})
export class HomeComponent {
  isMobileMenuOpen = false;
  
  totalBalance = 5420.75;
  monthlyExpenses = 1250.30;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
