import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

import { CustomerService } from '../services/customer.service';
import { 
  Customer, 
  CustomerCreateDto, 
  CustomerUpdateDto, 
  CustomerStatus 
} from '../models/customer.model';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbPaginationModule
  ],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  customerForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  selectedCustomer: Customer | null = null;
  isEditMode = false;
  totalCustomers = 0;
  currentPage = 1;
  pageSize = 10;
  searchQuery = '';

  // Customer status enum for template
  CustomerStatus = CustomerStatus;

  constructor(
    private customerService: CustomerService,
    private modalService: NgbModal,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadCustomers();
  }

  initializeForm(): void {
    this.customerForm = this.fb.group({
      firstName: ['', [
        Validators.required, 
        Validators.minLength(2), 
        Validators.maxLength(50)
      ]],
      lastName: ['', [
        Validators.maxLength(50)
      ]],
      phoneNumber: ['', [
        Validators.required, 
        Validators.pattern('^[0-9]{10}$')
      ]],
      aadhaarNumber: ['', [
        Validators.required, 
        Validators.pattern('^[0-9]{12}$')
      ]],
      street: ['', [
        Validators.required,
        Validators.maxLength(200)
      ]],
      city: ['', [
        Validators.required,
        Validators.maxLength(50)
      ]],
      state: ['', [
        Validators.required,
        Validators.maxLength(50)
      ]],
      location: ['', [
        Validators.maxLength(100)
      ]],
      profilePhoto: [null],
      aadhaarPhoto: [null]
    });
  }

  loadCustomers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.customerService.getCustomers(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.customers = response.data || [];
        this.totalCustomers = response.total;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load customers.';
        this.isLoading = false;
      }
    });
  }

  searchCustomers(): void {
    if (!this.searchQuery.trim()) {
      this.loadCustomers();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.customerService.searchCustomers(this.searchQuery, this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.customers = response.data || [];
        this.totalCustomers = response.total;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to search customers.';
        this.isLoading = false;
      }
    });
  }

  openAddCustomerModal(content: any): void {
    this.isEditMode = false;
    this.selectedCustomer = null;
    this.customerForm.reset();
    this.modalService.open(content, { 
      ariaLabelledBy: 'customer-modal-title',
      size: 'lg' 
    });
  }

  openEditCustomerModal(customer: Customer, content: any): void {
    this.isEditMode = true;
    this.selectedCustomer = customer;
    
    this.customerForm.patchValue({
      firstName: customer.firstName,
      lastName: customer.lastName || '',
      phoneNumber: customer.phoneNumber,
      aadhaarNumber: customer.aadhaarNumber,
      street: customer.street || '',
      city: customer.city || '',
      state: customer.state || '',
      location: customer.location || '',
      profilePhoto: null,  // Reset file inputs
      aadhaarPhoto: null
    });

    this.modalService.open(content, { 
      ariaLabelledBy: 'customer-modal-title',
      size: 'lg'
    });
  }

  onSubmit(): void {
    if (this.customerForm.invalid) {
      Object.keys(this.customerForm.controls).forEach(key => {
        const control = this.customerForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const customerData: CustomerCreateDto | CustomerUpdateDto = {
      firstName: this.customerForm.get('firstName')?.value,
      lastName: this.customerForm.get('lastName')?.value || undefined,
      phoneNumber: this.customerForm.get('phoneNumber')?.value,
      aadhaarNumber: this.customerForm.get('aadhaarNumber')?.value,
      street: this.customerForm.get('street')?.value,
      city: this.customerForm.get('city')?.value,
      state: this.customerForm.get('state')?.value,
      location: this.customerForm.get('location')?.value || undefined,
      profilePhoto: this.customerForm.get('profilePhoto')?.value,
      aadhaarPhoto: this.customerForm.get('aadhaarPhoto')?.value
    };

    if (this.isEditMode && this.selectedCustomer) {
      this.customerService.updateCustomer(this.selectedCustomer.id, customerData as CustomerUpdateDto).subscribe({
        next: (updatedCustomer) => {
          const index = this.customers.findIndex(c => c.id === updatedCustomer.id);
          if (index !== -1) {
            this.customers[index] = updatedCustomer;
          }
          this.modalService.dismissAll();
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to update customer.';
          this.isLoading = false;
        }
      });
    } else {
      this.customerService.createCustomer(customerData as CustomerCreateDto).subscribe({
        next: (newCustomer) => {
          this.customers.push(newCustomer);
          this.totalCustomers++;
          this.modalService.dismissAll();
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to create customer.';
          this.isLoading = false;
        }
      });
    }
  }

  deleteCustomer(customerId: number): void {
    const confirmDelete = confirm('Are you sure you want to delete this customer?');
    if (confirmDelete) {
      this.isLoading = true;
      this.customerService.deleteCustomer(customerId).subscribe({
        next: () => {
          this.customers = this.customers.filter(c => c.id !== customerId);
          this.totalCustomers--;
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to delete customer.';
          this.isLoading = false;
        }
      });
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadCustomers();
  }

  // File upload handling
  onFileChange(event: any, controlName: string): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        this.customerForm.get(controlName)?.setErrors({ 
          invalidType: true 
        });
        return;
      }

      if (file.size > maxSize) {
        this.customerForm.get(controlName)?.setErrors({ 
          maxSize: true 
        });
        return;
      }

      // Set file to form control
      this.customerForm.patchValue({
        [controlName]: file
      });
    }
  }

  // Helper method to get form validation error messages
  getErrorMessage(controlName: string): string {
    const control = this.customerForm.get(controlName);
    if (control?.hasError('required')) {
      return `${this.toTitleCase(controlName)} is required`;
    }
    if (control?.hasError('minlength')) {
      return `${this.toTitleCase(controlName)} is too short`;
    }
    if (control?.hasError('maxlength')) {
      return `${this.toTitleCase(controlName)} is too long`;
    }
    if (control?.hasError('pattern')) {
      return `Invalid ${this.toTitleCase(controlName)} format`;
    }
    return '';
  }

  // Helper method to convert control name to title case
  private toTitleCase(str: string): string {
    return str
      .replace(/([A-Z])/g, ' $1')  // Insert space before capital letters
      .replace(/^./, (char) => char.toUpperCase());  // Capitalize first letter
  }
}
