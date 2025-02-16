import { Component, OnInit, ViewChild, ElementRef, NgZone, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CustomerService } from '../services/customer.service';
import { Customer } from '../models/customer.model';
import { HeaderComponent } from '../shared/header/header.component';
import { HttpErrorResponse as CustomHttpErrorResponse } from '../models/error.model';

// Declare Bootstrap types
declare const bootstrap: {
  Modal?: {
    getOrCreateInstance(element: HTMLElement, options?: any): {
      show(): void;
      hide(): void;
      dispose(): void;
    };
  }
};

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
export class CustomersComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('customerModal', { static: true }) customerModal!: ElementRef;
  
  private modalInstance: any = null;
  customers: Customer[] = [];
  selectedCustomer: Customer | null = null;
  customerForm: FormGroup;
  isEditMode = false;
  searchQuery = '';
  errorMessage: string | null = null;

  constructor(
    private customerService: CustomerService,
    private fb: FormBuilder,
    private ngZone: NgZone
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

  ngAfterViewInit() {
    // Ensure view is fully initialized before setting up modal
    this.ngZone.runOutsideAngular(() => {
      // Wait for Bootstrap to be fully loaded
      this.waitForBootstrap();
    });
  }

  ngOnDestroy() {
    // Dispose of modal instance to prevent memory leaks
    if (this.modalInstance) {
      try {
        this.modalInstance.dispose();
      } catch (error) {
        console.error('Error disposing modal:', error);
      }
    }
  }

  private waitForBootstrap(attempts = 0) {
    // Check if Bootstrap is available, with a maximum number of attempts
    if (attempts > 10) {
      console.error('Bootstrap failed to load after multiple attempts');
      return;
    }

    if (typeof bootstrap === 'undefined' || !bootstrap.Modal) {
      // If Bootstrap is not available, try again after a short delay
      setTimeout(() => {
        this.waitForBootstrap(attempts + 1);
      }, 200);
      return;
    }

    // Bootstrap is available, initialize modal
    this.initializeBootstrapModal();
  }

  private initializeBootstrapModal() {
    // Ensure we have a modal element and Bootstrap is available
    if (!this.customerModal?.nativeElement) {
      console.error('Modal element is missing');
      return;
    }

    try {
      // Remove any existing modal instances
      const existingModals = document.querySelectorAll('.modal-backdrop');
      existingModals.forEach(modal => modal.remove());

      // Create modal instance
      this.modalInstance = bootstrap.Modal?.getOrCreateInstance(
        this.customerModal.nativeElement, 
        {
          backdrop: 'static',
          keyboard: false
        }
      );

      console.log('Modal initialized successfully');
    } catch (error) {
      console.error('Error initializing Bootstrap Modal:', error);
    }
  }

  // Open modal for adding a new customer
  openAddCustomerModal() {
    this.ngZone.run(() => {
      // Reset form
      this.customerForm.reset();
      this.isEditMode = false;
      this.errorMessage = null;
      
      // Open modal
      this.openModal();
    });
  }

  // Open modal for editing an existing customer
  openEditCustomerModal(customer: Customer) {
    this.ngZone.run(() => {
      // Populate form with customer data
      this.customerForm.patchValue({
        firstName: customer.firstName,
        lastName: customer.lastName,
        phoneNumber: customer.phoneNumber,
        aadhaarNumber: customer.aadhaarNumber,
        address: {
          street: customer.address.street,
          city: customer.address.city,
          state: customer.address.state,
          pinCode: customer.address.pinCode
        }
      });
      
      this.selectedCustomer = customer;
      this.isEditMode = true;
      this.errorMessage = null;
      
      // Open modal
      this.openModal();
    });
  }

  // Generic method to open modal
  private openModal() {
    this.ngZone.runOutsideAngular(() => {
      // Reinitialize modal if not created
      if (!this.modalInstance) {
        this.initializeBootstrapModal();
      }

      if (this.modalInstance) {
        try {
          // Remove any existing backdrops
          const existingBackdrops = document.querySelectorAll('.modal-backdrop');
          existingBackdrops.forEach(backdrop => backdrop.remove());

          // Show modal
          this.modalInstance.show();
        } catch (error) {
          console.error('Error showing modal:', error);
          // Attempt to reinitialize modal if show fails
          this.initializeBootstrapModal();
        }
      } else {
        console.error('Modal instance not initialized');
        this.initializeBootstrapModal();
      }
    });
  }

  // Generic method to close modal
  private closeModal() {
    this.ngZone.runOutsideAngular(() => {
      if (this.modalInstance) {
        try {
          this.modalInstance.hide();
        } catch (error) {
          console.error('Error hiding modal:', error);
        }
      }
    });
  }

  // Getters for form validation
  get firstNameErrors() {
    const control = this.customerForm.get('firstName');
    return control?.invalid && (control?.dirty || control?.touched);
  }

  get lastNameErrors() {
    const control = this.customerForm.get('lastName');
    return control?.invalid && (control?.dirty || control?.touched);
  }

  get phoneNumberErrors() {
    const control = this.customerForm.get('phoneNumber');
    return control?.invalid && (control?.dirty || control?.touched);
  }

  get aadhaarNumberErrors() {
    const control = this.customerForm.get('aadhaarNumber');
    return control?.invalid && (control?.dirty || control?.touched);
  }

  // Submit customer form (add or update)
  submitCustomer() {
    // Mark all fields as touched to show validation errors
    Object.keys(this.customerForm.controls).forEach(key => {
      const control = this.customerForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });

    if (this.customerForm.valid) {
      const customerData = this.customerForm.value;
      
      if (this.isEditMode && this.selectedCustomer) {
        // Update existing customer
        this.customerService.updateCustomer(this.selectedCustomer.id || '', customerData)
          .subscribe({
            next: (updatedCustomer) => {
              // Update customer in the list
              const index = this.customers.findIndex(c => c.id === updatedCustomer.id);
              if (index !== -1) {
                this.customers[index] = updatedCustomer;
              }
              
              // Close modal
              this.closeModal();
              this.errorMessage = null;
            },
            error: (error: CustomHttpErrorResponse) => {
              // Handle specific error scenarios
              this.errorMessage = error.error?.message || 
                                  error.message || 
                                  'An unexpected error occurred while updating the customer.';
              console.error('Error updating customer', error);
            }
          });
      } else {
        // Add new customer
        this.customerService.createCustomer(customerData)
          .subscribe({
            next: (newCustomer) => {
              // Add customer to the list
              this.customers.push(newCustomer);
              
              // Close modal
              this.closeModal();
              this.errorMessage = null;
            },
            error: (error: CustomHttpErrorResponse) => {
              // Handle specific error scenarios
              this.errorMessage = error.error?.message || 
                                  error.message || 
                                  'An unexpected error occurred while adding the customer.';
              console.error('Error adding customer', error);
            }
          });
      }
    }
  }

  // Load customers from service
  loadCustomers() {
    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
      },
      error: (error: CustomHttpErrorResponse) => {
        // Handle error when fetching customers
        this.errorMessage = error.error?.message || 
                            error.message || 
                            'An unexpected error occurred while fetching customers.';
        console.error('Error fetching customers', error);
      }
    });
  }

  // Delete a customer
  deleteCustomer(customerId: string) {
    this.customerService.deleteCustomer(customerId).subscribe({
      next: () => {
        // Remove customer from the list
        this.customers = this.customers.filter(c => c.id !== customerId);
        this.errorMessage = null;
      },
      error: (error: CustomHttpErrorResponse) => {
        // Handle error when deleting customer
        this.errorMessage = error.error?.message || 
                            error.message || 
                            'An unexpected error occurred while deleting the customer.';
        console.error('Error deleting customer', error);
      }
    });
  }

  // Search customers
  searchCustomers() {
    if (!this.searchQuery) {
      this.loadCustomers();
      return;
    }

    this.customers = this.customers.filter(customer => 
      customer.firstName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      customer.aadhaarNumber.includes(this.searchQuery)
    );
  }
}
