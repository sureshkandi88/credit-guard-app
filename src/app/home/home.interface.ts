export interface TransactionSummary {
  id: string;
  customerName: string;
  amount: number;
  type: 'credit' | 'debit';
  date: Date;
  status: 'completed' | 'pending' | 'failed';
}

export interface GroupSummary {
  id: string;
  name: string;
  memberCount: number;
  totalBalance: number;
  lastActivity: Date;
}

export interface DashboardMetrics {
  totalBalance: number;
  monthlyExpenses: number;
  savingsRate: number;
  activeLoans: number;
  totalCustomers: number;
  recentTransactions: TransactionSummary[];
  topGroups: GroupSummary[];
}