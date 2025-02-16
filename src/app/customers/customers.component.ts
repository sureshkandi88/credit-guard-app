import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CustomerService } from '../services/customer.service';
import { Customer } from '../models/customer.model';
import { HeaderComponent } from '../shared/header/header.component';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    RouterModule, 
    HeaderComponent
  ],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  selectedCustomer: Customer | null = null;
  customerForm: FormGroup;
  isEditMode = false;
  searchQuery = '';

  constructor(
    private customerService: CustomerService,
    private fb: FormBuilder
  ) {
    this.customerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      aadhaarNumber: ['', [Validators.required, Validators.pattern(/^\d{12}$/)]],
      address: this.fb.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        pinCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
      })
    });
  }

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
      },
      error: (error) => {
        console.error('Error loading customers', error);
        // TODO: Add user-friendly error handling
      }
    });
  }

  searchCustomers() {
    if (!this.searchQuery.trim()) {
      this.loadCustomers();
      return;
    }

    this.customerService.searchCustomers(this.searchQuery).subscribe({
      next: (customers) => {
        this.customers = customers;
      },
      error: (error) => {
        console.error('Error searching customers', error);
        // TODO: Add user-friendly error handling
      }
    });
  }

  openAddCustomerModal() {
    this.isEditMode = false;
    this.selectedCustomer = null;
    this.customerForm.reset();
  }

  openEditCustomerModal(customer: Customer) {
    this.isEditMode = true;
    this.selectedCustomer = customer;
    this.customerForm.patchValue({
      firstName: customer.firstName,
      lastName: customer.lastName,
      phoneNumber: customer.phoneNumber,
      aadhaarNumber: customer.aadhaarNumber,
      address: customer.address
    });
  }

  submitCustomer() {
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }

    const customerData: Customer = {
      ...this.customerForm.value,
      id: this.isEditMode && this.selectedCustomer ? this.selectedCustomer.id : undefined
    };

    if (this.isEditMode && this.selectedCustomer?.id) {
      this.updateCustomer(this.selectedCustomer.id, customerData);
    } else {
      this.addCustomer(customerData);
    }
  }

  addCustomer(customer: Customer) {
    this.customerService.createCustomer(customer).subscribe({
      next: (newCustomer) => {
        this.customers.push(newCustomer);
        this.customerForm.reset();
        // TODO: Add success toast/notification
      },
      error: (error) => {
        console.error('Error adding customer', error);
        // TODO: Add user-friendly error handling
      }
    });
  }

  updateCustomer(id: string, customer: Customer) {
    this.customerService.updateCustomer(id, customer).subscribe({
      next: (updatedCustomer) => {
        const index = this.customers.findIndex(c => c.id === id);
        if (index !== -1) {
          this.customers[index] = updatedCustomer;
        }
        this.customerForm.reset();
        // TODO: Add success toast/notification
      },
      error: (error) => {
        console.error('Error updating customer', error);
        // TODO: Add user-friendly error handling
      }
    });
  }

  deleteCustomer(id: string) {
    // Confirm deletion
    const confirmDelete = window.confirm('Are you sure you want to delete this customer?');
    
    if (confirmDelete) {
      this.customerService.deleteCustomer(id).subscribe({
        next: () => {
          this.customers = this.customers.filter(c => c.id !== id);
          // TODO: Add success toast/notification
        },
        error: (error) => {
          console.error('Error deleting customer', error);
          // TODO: Add user-friendly error handling
        }
      });
    }
  }

  // Form validation helpers
  get firstNameErrors() {
    const control = this.customerForm.get('firstName');
    return control?.errors && control.touched;
  }

  get lastNameErrors() {
    const control = this.customerForm.get('lastName');
    return control?.errors && control.touched;
  }

  get phoneNumberErrors() {
    const control = this.customerForm.get('phoneNumber');
    return control?.errors && control.touched;
  }

  get aadhaarNumberErrors() {
    const control = this.customerForm.get('aadhaarNumber');
    return control?.errors && control.touched;
  }
}
