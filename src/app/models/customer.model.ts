export interface Customer {
  id?: number;
  firstName: string;
  lastName?: string;
  phoneNumber: string;
  aadhaarNumber: string;
  street: string;
  cityName: string;
  state: string;
  location?: string;
  profilePictureId?: string | null;
  aadhaarPictureId?: string | null;
  isActive: boolean;
  activeGroupId?: number | null;
  activeGroup?: Group | null;
  customerGroups?: CustomerGroup[] | null;
  emiTransactions?: EmiTransaction[] | null;
  fullAddress?: string;
}

export interface CustomerCreateDto {
  firstName: string;
  lastName?: string;
  phoneNumber: string;
  aadhaarNumber: string;
  street: string;
  cityName: string;
  state: string;
  location: string;
  profilePhoto: File | null;
  aadhaarPhoto: File | null;
}

export interface CustomerUpdateDto {
  id?: number;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  aadhaarNumber?: string;
  street?: string;
  cityName?: string;
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
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  isActive: boolean;
  customerGroups?: CustomerGroup[];
  activeCustomers?: Customer[];
}

export interface EmiTransaction {

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
  Cancelled = 3,
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
  Defaulted = 3,
}

export enum CustomerStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Suspended = 'Suspended',
}
