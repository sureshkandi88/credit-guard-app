import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { SignupComponent } from './signup/signup.component';
import { AuthGuard } from './auth.guard';
import { CustomersComponent } from './customers/customers.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { ReportsComponent } from './reports/reports.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { 
    path: 'home', 
    component: HomeComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'transactions', 
    component: TransactionsComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'reports', 
    component: ReportsComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'customers', 
    component: CustomersComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/login' }
];
