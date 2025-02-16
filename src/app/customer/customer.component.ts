import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CustomerService } from '../services/customer.service';
import { Customer } from '../models/customer.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class CustomerComponent implements OnInit {
  customerForm: FormGroup;
  customers: Customer[] = [];
  selectedCustomer: Customer | null = null;
  isEditMode = false;
  photoPreview: string | ArrayBuffer | null = null;
  aadhaarPhotoPreview: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private router: Router
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
      }),
      photo: [null],
      aadhaarPhoto: [null]
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

  onSubmit() {
    if (this.customerForm.valid) {
      const customerData: Customer = this.customerForm.value;

      if (this.isEditMode && this.selectedCustomer?.id) {
        // Update existing customer
        this.customerService.updateCustomer(this.selectedCustomer.id, customerData).subscribe({
          next: (updatedCustomer) => {
            this.loadCustomers();
            this.resetForm();
          },
          error: (error) => {
            console.error('Error updating customer', error);
            // TODO: Add user-friendly error handling
          }
        });
      } else {
        // Create new customer
        this.customerService.createCustomer(customerData).subscribe({
          next: (newCustomer) => {
            this.loadCustomers();
            this.resetForm();
          },
          error: (error) => {
            console.error('Error creating customer', error);
            // TODO: Add user-friendly error handling
          }
        });
      }
    }
  }

  editCustomer(customer: Customer) {
    this.selectedCustomer = customer;
    this.isEditMode = true;
    this.customerForm.patchValue(customer);
    
    // Reset photo previews
    this.photoPreview = customer.photo || null;
    this.aadhaarPhotoPreview = customer.aadhaarPhoto || null;
  }

  deleteCustomer(customerId: string) {
    if (confirm('Are you sure you want to delete this customer?')) {
      this.customerService.deleteCustomer(customerId).subscribe({
        next: () => {
          this.loadCustomers();
          this.resetForm();
        },
        error: (error) => {
          console.error('Error deleting customer', error);
          // TODO: Add user-friendly error handling
        }
      });
    }
  }

  resetForm() {
    this.customerForm.reset();
    this.selectedCustomer = null;
    this.isEditMode = false;
    this.photoPreview = null;
    this.aadhaarPhotoPreview = null;
  }

  onPhotoSelected(event: Event, photoType: 'photo' | 'aadhaarPhoto') {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        if (photoType === 'photo') {
          this.photoPreview = e.target?.result || null;
          this.customerForm.patchValue({ photo: file });
        } else {
          this.aadhaarPhotoPreview = e.target?.result || null;
          this.customerForm.patchValue({ aadhaarPhoto: file });
        }
      };

      reader.readAsDataURL(file);
    }
  }
}
