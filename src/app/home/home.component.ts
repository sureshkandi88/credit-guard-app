import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HeaderComponent } from '../shared/header/header.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { DashboardMetrics, TransactionSummary, GroupSummary } from './home.interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    RouterModule,
    HeaderComponent,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule
  ]
})
export class HomeComponent implements OnInit {
  dashboardData: DashboardMetrics;
  displayedColumns: string[] = ['customerName', 'amount', 'type', 'date', 'status'];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.dashboardData = {
      totalBalance: 5420.75,
      monthlyExpenses: 1250.30,
      savingsRate: 25,
      activeLoans: 12,
      totalCustomers: 45,
      recentTransactions: [
        {
          id: '1',
          customerName: 'Rahul Kumar',
          amount: 1000,
          type: 'credit',
          date: new Date('2024-01-15'),
          status: 'completed'
        },
        {
          id: '2',
          customerName: 'Priya Sharma',
          amount: 500,
          type: 'debit',
          date: new Date('2024-01-14'),
          status: 'pending'
        },
        {
          id: '3',
          customerName: 'Amit Patel',
          amount: 750,
          type: 'credit',
          date: new Date('2024-01-13'),
          status: 'completed'
        }
      ],
      topGroups: [
        {
          id: '1',
          name: 'Small Business Group',
          memberCount: 15,
          totalBalance: 25000,
          lastActivity: new Date('2024-01-15')
        },
        {
          id: '2',
          name: 'Women Entrepreneurs',
          memberCount: 12,
          totalBalance: 18000,
          lastActivity: new Date('2024-01-14')
        },
        {
          id: '3',
          name: 'Farmers Coalition',
          memberCount: 8,
          totalBalance: 12000,
          lastActivity: new Date('2024-01-13')
        }
      ]
    };
  }

  ngOnInit() {
    // Future implementation: Fetch real data from a service
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'completed': return 'green';
      case 'pending': return 'orange';
      case 'failed': return 'red';
      default: return 'black';
    }
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
