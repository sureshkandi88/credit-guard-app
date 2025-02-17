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
  customerForm!: FormGroup;
  isEditMode = false;
  searchQuery = '';
  errorMessage: string | null = null;

  // Photo-related properties
  profilePhotoPreview: string | ArrayBuffer | null = null;
  aadhaarPhotoPreview: string | ArrayBuffer | null = null;

  constructor(
    private customerService: CustomerService,
    private fb: FormBuilder,
    private ngZone: NgZone
  ) {
    this.initializeForm();
  }

  private initializeForm() {
    this.customerForm = this.fb.group({
      firstName: ['', [
        Validators.required, 
        Validators.minLength(2), 
        Validators.maxLength(50)
      ]],
      lastName: ['', [
        Validators.required, 
        Validators.minLength(2), 
        Validators.maxLength(50)
      ]],
      phoneNumber: ['', [
        Validators.required, 
        Validators.pattern(/^[6-9]\d{9}$/)
      ]],
      aadhaarNumber: ['', [
        Validators.required, 
        Validators.pattern(/^\d{12}$/)
      ]],
      address: this.fb.group({
        street: ['', [
          Validators.required, 
          Validators.minLength(10), 
          Validators.maxLength(200)
        ]],
        city: ['', [
          Validators.required, 
          Validators.minLength(2), 
          Validators.maxLength(50)
        ]],
        state: ['', [
          Validators.required, 
          Validators.minLength(2), 
          Validators.maxLength(50)
        ]],
        pinCode: ['', [
          Validators.required, 
          Validators.pattern(/^\d{6}$/)
        ]]
      }),
      profilePhoto: [null],
      aadhaarPhoto: [null]
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
      console.log('Editing customer:', customer); // Add logging for debugging
      
      // Parse the address string
      const parseAddress = (addressString: string) => {
        // Expected format: "Street, City, State - PinCode"
        const parts = addressString.split(', ');
        const street = parts[0] || '';
        
        // Split the second part to get city, state, and pinCode
        const cityStatePinCode = parts[1] ? parts[1].split(' - ') : ['', ''];
        const city = cityStatePinCode[0] || '';
        
        const stateAndPinCode = cityStatePinCode[1] ? cityStatePinCode[1].split(' ') : ['', ''];
        const state = stateAndPinCode[0] || '';
        const pinCode = stateAndPinCode[1] || '';

        return { street, city, state, pinCode };
      };

      // Parse the name into first and last name
      const parseName = (firstName: string, lastName: string) => {
        return { firstName, lastName };
      };

      // Parse name and address
      const { firstName, lastName } = parseName(customer.firstName, customer.lastName);
      const { street, city, state, pinCode } = parseAddress(customer.address);

      // Populate form with customer data
      this.customerForm.patchValue({
        firstName: firstName,
        lastName: lastName,
        phoneNumber: customer.phoneNumber || '',
        aadhaarNumber: customer.aadhaarNumber || '',
        address: {
          street: street,
          city: city,
          state: state,
          pinCode: pinCode
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

  // Photo upload methods
  onProfilePhotoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type and size
      if (!this.isValidImageFile(file)) {
        this.customerForm.get('profilePhoto')?.setErrors({ invalidFile: true });
        return;
      }

      // Read and preview the file
      const reader = new FileReader();
      reader.onload = () => {
        this.profilePhotoPreview = reader.result;
        this.customerForm.get('profilePhoto')?.setValue(file);
      };
      reader.readAsDataURL(file);
    }
  }

  onAadhaarPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type and size
      if (!this.isValidImageFile(file)) {
        this.customerForm.get('aadhaarPhoto')?.setErrors({ invalidFile: true });
        return;
      }

      // Read and preview the file
      const reader = new FileReader();
      reader.onload = () => {
        this.aadhaarPhotoPreview = reader.result;
        this.customerForm.get('aadhaarPhoto')?.setValue(file);
      };
      reader.readAsDataURL(file);
    }
  }

  clearProfilePhoto() {
    this.profilePhotoPreview = null;
    this.customerForm.get('profilePhoto')?.setValue(null);
    // Reset file input
    const fileInput = document.getElementById('profilePhoto') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  clearAadhaarPhoto() {
    this.aadhaarPhotoPreview = null;
    this.customerForm.get('aadhaarPhoto')?.setValue(null);
    // Reset file input
    const fileInput = document.getElementById('aadhaarPhoto') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  // Validate image file
  private isValidImageFile(file: File): boolean {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return false;
    }

    // Validate file size (5MB max)
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    return file.size <= maxSizeInBytes;
  }

  // Error message methods
  getProfilePhotoErrorMessage(): string {
    const control = this.customerForm.get('profilePhoto');
    if (control?.hasError('invalidFile')) {
      return 'Invalid file. Please upload a JPEG, PNG, or JPG file under 5MB.';
    }
    return '';
  }

  getAadhaarPhotoErrorMessage(): string {
    const control = this.customerForm.get('aadhaarPhoto');
    if (control?.hasError('invalidFile')) {
      return 'Invalid file. Please upload a JPEG, PNG, or JPG file under 5MB.';
    }
    return '';
  }

  // Getter for lastName form control
  get lastName() {
    return this.customerForm.get('lastName');
  }

  // Getter for firstName form control
  get firstName() {
    return this.customerForm.get('firstName');
  }

  // Getter methods for form field errors
  get nameErrors(): boolean {
    const control = this.customerForm.get('firstName');
    return control ? (control.invalid && (control.dirty || control.touched)) : false;
  }

  get phoneNumberErrors(): boolean {
    const control = this.customerForm.get('phoneNumber');
    return control ? (control.invalid && (control.dirty || control.touched)) : false;
  }

  get aadhaarNumberErrors(): boolean {
    const control = this.customerForm.get('aadhaarNumber');
    return control ? (control.invalid && (control.dirty || control.touched)) : false;
  }

  get addressErrors(): boolean {
    const control = this.customerForm.get('address');
    return control ? (control.invalid && (control.dirty || control.touched)) : false;
  }

  // Getter methods for address form group errors
  get streetErrors(): boolean {
    const addressGroup = this.customerForm.get('address');
    const streetControl = addressGroup?.get('street');
    return streetControl ? (streetControl.invalid && (streetControl.dirty || streetControl.touched)) : false;
  }

  get cityErrors(): boolean {
    const addressGroup = this.customerForm.get('address');
    const cityControl = addressGroup?.get('city');
    return cityControl ? (cityControl.invalid && (cityControl.dirty || cityControl.touched)) : false;
  }

  get stateErrors(): boolean {
    const addressGroup = this.customerForm.get('address');
    const stateControl = addressGroup?.get('state');
    return stateControl ? (stateControl.invalid && (stateControl.dirty || stateControl.touched)) : false;
  }

  get pinCodeErrors(): boolean {
    const addressGroup = this.customerForm.get('address');
    const pinCodeControl = addressGroup?.get('pinCode');
    return pinCodeControl ? (pinCodeControl.invalid && (pinCodeControl.dirty || pinCodeControl.touched)) : false;
  }

  // Getter methods for photo errors
  get profilePhotoErrors(): boolean {
    const control = this.customerForm.get('profilePhoto');
    return control ? (control.invalid && (control.dirty || control.touched)) : false;
  }

  get aadhaarPhotoErrors(): boolean {
    const control = this.customerForm.get('aadhaarPhoto');
    return control ? (control.invalid && (control.dirty || control.touched)) : false;
  }

  // Submit customer form (add or update)
  submitCustomer() {
    if (this.customerForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    const formValue = this.customerForm.value;
    const customerData = new FormData();

    // Combine first and last name
    const name = `${formValue.firstName} ${formValue.lastName}`.trim();
    customerData.append('Name', name);

    // Append other form data
    customerData.append('FirstName', formValue.firstName);
    customerData.append('LastName', formValue.lastName);
    customerData.append('PhoneNumber', formValue.phoneNumber);
    customerData.append('AadhaarNumber', formValue.aadhaarNumber);

    // Address handling
    const addressString = `${formValue.address.street}, ${formValue.address.city}, ${formValue.address.state} - ${formValue.address.pinCode}`;
    customerData.append('Address', addressString);

    // Profile photo handling
    if (this.customerForm.get('profilePhoto')?.value) {
      customerData.append('ProfilePhoto', this.customerForm.get('profilePhoto')?.value);
    }

    // Aadhaar photo handling
    if (this.customerForm.get('aadhaarPhoto')?.value) {
      customerData.append('AadhaarPhoto', this.customerForm.get('aadhaarPhoto')?.value);
    }

    // Determine if it's create or update mode
    if (this.isEditMode && this.selectedCustomer) {
      // Update existing customer
      this.customerService.updateCustomer(this.selectedCustomer.id || '', customerData)
        .subscribe({
          next: (updatedCustomer) => {
            // Update the customer in the list
            const index = this.customers.findIndex(c => c.id === updatedCustomer.id);
            if (index !== -1) {
              this.customers[index] = updatedCustomer;
            }
            this.closeModal();
            this.loadCustomers(); // Refresh the list
          },
          error: (error) => {
            this.errorMessage = error.error || 'Failed to update customer';
          }
        });
    } else {
      // Create new customer
      this.customerService.createCustomer(customerData)
        .subscribe({
          next: (newCustomer) => {
            this.customers.push(newCustomer);
            this.closeModal();
          },
          error: (error) => {
            this.errorMessage = error.error || 'Failed to create customer';
          }
        });
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

    const query = this.searchQuery.toLowerCase();
    this.customers = this.customers.filter(customer => 
      customer.firstName.toLowerCase().includes(query) ||
      customer.lastName.toLowerCase().includes(query) ||
      customer.aadhaarNumber.toLowerCase().includes(query) ||
      customer.phoneNumber.toLowerCase().includes(query)
    );
  }
}
