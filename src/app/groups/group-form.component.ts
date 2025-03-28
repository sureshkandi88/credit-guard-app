import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormArray, Validators } from '@angular/forms';
import { GroupService } from '../services/group.service';
import { Router } from '@angular/router';

type CustomerGroupForm = {
  customerId: number;
  joinedAt: Date;
  isActive: boolean;
};

type DebtForm = {
  totalAmount: number;
  remainingAmount: number;
  totalEMICount: number;
  emiAmount: number;
  status: number;
  startDate: Date;
  endDate: Date;
};

type EmiTransactionForm = {
  debtId: number;
  customerId: number;
  emiNumber: number;
  emiAmount: number;
  status: number;
  dueDate: Date;
  paidDate: Date;
  paidAmount: number;
};

@Component({
  selector: 'app-group-form',
  templateUrl: './group-form.component.html',
  styleUrls: ['./group-form.component.scss']
})
export class GroupFormComponent implements OnInit {
  groupForm = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    location: ['', Validators.required],
    isActive: [true],
    customerGroups: this.fb.array<CustomerGroupForm>([]),
    debts: this.fb.array<DebtForm>([]),
    activeCustomers: this.fb.array([]),
    emiTransactions: this.fb.array<EmiTransactionForm>([])
  });

  constructor(
    private fb: FormBuilder,
    private groupService: GroupService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    // Initialize with empty form arrays
    this.addCustomerGroup();
    this.addDebt();
    this.addEmiTransaction();
  }

  get customerGroups() {
    return this.groupForm.get('customerGroups') as FormArray;
  }

  get debts() {
    return this.groupForm.get('debts') as FormArray;
  }

  get emiTransactions() {
    return this.groupForm.get('emiTransactions') as FormArray;
  }

  addCustomerGroup(): void {
    this.customerGroups.push(this.fb.group({
      customerId: ['', Validators.required],
      joinedAt: [new Date().toISOString()],
      isActive: [true]
    }));
  }

  addDebt(): void {
    this.debts.push(this.fb.group({
      totalAmount: ['', [Validators.required, Validators.min(1)]],
      remainingAmount: ['', [Validators.required, Validators.min(0)]],
      totalEMICount: ['', [Validators.required, Validators.min(1)]],
      emiAmount: ['', [Validators.required, Validators.min(1)]],
      status: [0],
      startDate: [new Date().toISOString()],
      endDate: [new Date().toISOString()]
    }));
  }

  addEmiTransaction(): void {
    this.emiTransactions.push(this.fb.group({
      debtId: ['', Validators.required],
      customerId: ['', Validators.required],
      emiNumber: ['', [Validators.required, Validators.min(1)]],
      emiAmount: ['', [Validators.required, Validators.min(1)]],
      status: [0],
      dueDate: [new Date().toISOString()],
      paidDate: [null],
      paidAmount: [0]
    }));
  }

  onSubmit(): void {
    if (this.groupForm.valid) {
      const formData = {
        ...this.groupForm.value,
        customerGroups: this.groupForm.value.customerGroups?.map(cg => ({
          customerId: cg.customerId,
          joinedAt: new Date(cg.joinedAt),
          isActive: cg.isActive
        })),
        debts: this.groupForm.value.debts?.map(debt => ({
          totalAmount: debt.totalAmount,
          remainingAmount: debt.remainingAmount,
          totalEMICount: debt.totalEMICount,
          emiAmount: debt.emiAmount,
          status: debt.status,
          startDate: new Date(debt.startDate),
          endDate: new Date(debt.endDate)
        })),
        emiTransactions: this.groupForm.value.emiTransactions?.map(txn => ({
          debtId: txn.debtId,
          customerId: txn.customerId,
          emiNumber: txn.emiNumber,
          emiAmount: txn.emiAmount,
          status: txn.status,
          dueDate: new Date(txn.dueDate),
          paidDate: txn.paidDate ? new Date(txn.paidDate) : null,
          paidAmount: txn.paidAmount
        }))
      };

      this.groupService.createGroup(formData).subscribe({
        next: (group) => this.router.navigate(['/groups', group.id]),
        error: (err) => console.error('Group creation failed:', err)
      });
    }
  }
}