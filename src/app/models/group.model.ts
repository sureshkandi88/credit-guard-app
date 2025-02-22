export interface Debt {
  id?: string;
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
  id?: string;
  amount: number;
}

export interface Group {
  id?: string;
  name: string;
  description?: string;
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
  description?: string;
  debts?: Debt[];
  customerGroups?: CustomerGroup[];
  activeCustomers?: Customer[];
  emiTransactions?: EmiTransaction[];
}

export interface GroupUpdateDto {
  name?: string;
  description?: string;
  isActive?: boolean;
  debts?: Debt[];
  customerGroups?: CustomerGroup[];
  activeCustomers?: Customer[];
  emiTransactions?: EmiTransaction[];
}
