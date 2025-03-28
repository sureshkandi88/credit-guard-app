export interface Debt {
  id: number;
  amount: number;
}

export interface CustomerGroup {
  customerId: string;
  groupId: string;
}

export interface Customer {
  id: string;
  name: string;
}

export interface EmiTransaction {
  id: number;
  amount: number;
}

export interface Group {
  id: number;
  name: string;
  description?: string;
  location: string;
  memberCount?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  isActive?: boolean;
  debts: Debt[];
  customerGroups: CustomerGroup[];
  activeCustomers: Customer[];
  emiTransactions: EmiTransaction[];
}

export interface GroupCreateDto {
  name: string;
  description: string;
  isActive: boolean;
  location: string;
  customerGroups: CustomerGroupDto[];
  debts: DebtDto[];
  activeCustomers: Customer[];
  emiTransactions: EmiTransactionDto[];
}

export interface CustomerGroupDto {
  customerId: number;
  joinedAt: Date;
  isActive: boolean;
}

export interface DebtDto {
  totalAmount: number;
  remainingAmount: number;
  totalEMICount: number;
  emiAmount: number;
  status: number;
  startDate: Date;
  endDate: Date;
}

export interface EmiTransactionDto {
  debtId: number;
  customerId: number;
  emiNumber: number;
  emiAmount: number;
  status: number;
  dueDate: Date;
  paidDate: Date;
  paidAmount: number;
}

export interface GroupUpdateDto {
  name?: string;
  description?: string;
  location?: string;
  isActive?: boolean;
  debts?: Debt[];
  customerGroups?: CustomerGroup[];
  activeCustomers?: Customer[];
  emiTransactions?: EmiTransaction[];
}
