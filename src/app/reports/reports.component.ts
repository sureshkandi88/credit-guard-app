import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../shared/header/header.component';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  template: `
    <div class="reports-container">
      <app-header activeRoute="reports"></app-header>
      <main class="reports-content">
        <h2>Reports</h2>
        <p>Financial reports and analytics will be displayed here.</p>
      </main>
    </div>
  `,
  styles: [`
    .reports-content {
      padding: 1rem;
      max-width: 1200px;
      margin: 0 auto;
    }
  `]
})
export class ReportsComponent {}
