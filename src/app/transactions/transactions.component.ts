import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../shared/header/header.component';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  template: `
    <div class="transactions-container">
      <app-header activeRoute="transactions"></app-header>
      <main class="transactions-content">
        <h2>Transactions</h2>
        <p>Your recent financial transactions will be listed here.</p>
      </main>
    </div>
  `,
  styles: [`
    .transactions-content {
      padding: 1rem;
      max-width: 1200px;
      margin: 0 auto;
    }
  `]
})
export class TransactionsComponent {}
