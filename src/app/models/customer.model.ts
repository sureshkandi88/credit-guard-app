export interface Customer {
  id: number;
  firstName: string;
  lastName?: string;
  phoneNumber: string;
  aadhaarNumber: string;
  street: string;
  city: string;
  state: string;
  location?: string;
  profilePhotoPath?: string;
  aadhaarPhotoPath?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  activeGroupId?: number;
  activeGroup?: Group;
  customerGroups?: CustomerGroup[];
  emiTransactions?: EmiTransaction[];
  fullAddress?: string;
}

export interface CustomerCreateDto {
  firstName: string;
  lastName?: string;
  phoneNumber: string;
  aadhaarNumber: string;
  street: string;
  city: string;
  state: string;
  location?: string;
  profilePhoto?: File | null;
  aadhaarPhoto?: File | null;
}

export interface CustomerUpdateDto {
  id?: number;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  aadhaarNumber?: string;
  street?: string;
  city?: string;
  state?: string;
  location?: string;
  profilePhoto?: File | null;
  aadhaarPhoto?: File | null;
  isActive?: boolean;
}

export interface CustomerGroup {
  customerId: number;
  customer?: Customer;
  groupId: number;
  group?: Group;
  joinedAt: Date;
  isActive: boolean;
}

export interface CustomerPaginatedResponse {
  data: Customer[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Group {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  isActive: boolean;
  customerGroups?: CustomerGroup[];
  activeCustomers?: Customer[];
}

export interface EmiTransaction {
  id: number;
  debtId: number;
  debt?: Debt;
  customerId: number;
  customer?: Customer;
  groupId: number;
  group?: Group;
  emiNumber: number;
  emiAmount: number;
  status: EmiTransactionStatus;
  dueDate: Date;
  paidDate?: Date;
  paidAmount?: number;
}

export enum EmiTransactionStatus {
  Pending = 0,
  Paid = 1,
  Overdue = 2,
  Cancelled = 3
}

export interface Debt {
  id: number;
  groupId: number;
  group?: Group;
  totalAmount: number;
  remainingAmount: number;
  totalEMICount: number;
  emiAmount: number;
  status: DebtStatus;
  createdAt: Date;
  startDate?: Date;
  endDate?: Date;
  emiTransactions?: EmiTransaction[];
}

export enum DebtStatus {
  Pending = 0,
  Active = 1,
  Completed = 2,
  Defaulted = 3
}

export enum CustomerStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Suspended = 'Suspended'
}
