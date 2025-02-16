import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../shared/header/header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  template: `
    <div class="dashboard-container">
      <app-header activeRoute="dashboard"></app-header>
      <main class="dashboard-content">
        <h2>Dashboard</h2>
        <p>Your financial overview and key metrics will be displayed here.</p>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-content {
      padding: 1rem;
      max-width: 1200px;
      margin: 0 auto;
    }
  `]
})
export class DashboardComponent {}
