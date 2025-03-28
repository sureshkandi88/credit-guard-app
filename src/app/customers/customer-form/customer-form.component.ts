import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomerCreateDto } from '../../models/customer.model';

@Component({
  selector: 'app-customer-form',
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.scss'],
})
export class CustomerFormComponent implements OnInit {
  @Input() initialData?: CustomerCreateDto;
  @Output() formSubmit = new EventEmitter<FormData>();

  type CustomerForm = {
    firstName: FormControl<string>;
    lastName: FormControl<string>;
    phoneNumber: FormControl<string>;
    aadhaarNumber: FormControl<string>;
    address: FormGroup<{
      street: FormControl<string>;
      city: FormControl<string>;
      state: FormControl<string>;
    }>;
    profilePhoto: FormControl<File | null>;
    aadhaarPhoto: FormControl<File | null>;
  }

  customerForm: FormGroup<CustomerForm>;

  constructor(private fb: FormBuilder) {
    this.customerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: [''],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      aadhaarNumber: [
        '',
        [Validators.required, Validators.pattern(/^\d{12}$/)],
      ],
      address: this.fb.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
      }),
      profilePhoto: [null],
      aadhaarPhoto: [null],
    });
  }

  ngOnInit(): void {
    if (this.initialData) {
      this.customerForm.patchValue(this.initialData);
    }
  }

  onFileSelected(event: any, field: string): void {
    const file = event.target.files[0];
    if (file) {
      this.customerForm.get(field)?.setValue(file);
    }
  }

onSubmit(): void {
    if(this.customerForm.valid) {

      const formData = new FormData();
      const formValue = this.customerForm.value;

      // Append address fields
      formData.append('street', formValue.street);
      formData.append('cityName', formValue.cityName);
      formData.append('state', formValue.state);
      formData.append('location', formValue.location);

      // Append other fields
      // Append other fields
      ['firstName', 'lastName', 'phoneNumber', 'aadhaarNumber'].forEach((key) => {
        if (formValue[key]) {
          formData.append(key, formValue[key]);
        }
      });

      // Append files
      if (formValue.profilePhoto) {
        formData.append('profilePhoto', formValue.profilePhoto);
      }
      if (formValue.aadhaarPhoto) {
        formData.append('aadhaarPhoto', formValue.aadhaarPhoto);
      }

      this.formSubmit.emit(formData);
    }
  }
}
