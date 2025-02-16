import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class HeaderComponent implements OnInit {
  @Input() activeRoute: string = '';
  isMobileMenuOpen = false;
  currentRoute: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateActiveRoute();
    });
    this.updateActiveRoute();
  }

  private updateActiveRoute() {
    const urlSegments = this.router.url.split('/');
    this.currentRoute = urlSegments[1] || 'home';
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isRouteActive(route: string): boolean {
    return this.currentRoute === route;
  }
}
