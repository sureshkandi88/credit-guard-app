import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Customer,
  CustomerCreateDto,
  CustomerUpdateDto,
  CustomerPaginatedResponse,
} from '../models/customer.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private apiUrl = `${environment.apiBaseUrl}/customer`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Get authentication headers
  private getAuthHeaders(isFormData: boolean = false): HttpHeaders {
    const token = this.authService.getAuthToken();
    const headers: { [key: string]: string } = {
      Authorization: `Bearer ${token}`,
    };

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    return new HttpHeaders(headers);
  }

  // Get paginated list of customers
  getCustomers(
    page: number = 1,
    pageSize: number = 10
  ): Observable<CustomerPaginatedResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<CustomerPaginatedResponse>(this.apiUrl, {
      headers: this.getAuthHeaders(),
      params: params,
    });
  }

  // Get a single customer by ID
  getCustomerById(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Create a new customer with file upload
  createCustomer(customerData: CustomerCreateDto): Observable<Customer> {
    const formData = new FormData();

    // Append text fields
    Object.keys(customerData).forEach((key) => {
      const value = customerData[key as keyof CustomerCreateDto];
      if (value !== undefined && value !== null && !(value instanceof File)) {
        formData.append(key, value.toString());
      }
    });

    // Append files
    if (customerData.profilePhoto) {
      formData.append(
        'profilePhoto',
        customerData.profilePhoto,
        customerData.profilePhoto.name
      );
    }
    if (customerData.aadhaarPhoto) {
      formData.append(
        'aadhaarPhoto',
        customerData.aadhaarPhoto,
        customerData.aadhaarPhoto.name
      );
    }

    return this.http.post<Customer>(`${this.apiUrl}`, formData, {
      headers: this.getAuthHeaders(true).set('Accept', 'application/json'),
    });
  }

  // Update an existing customer with file upload
  updateCustomer(
    id: number | undefined,
    customerData: CustomerUpdateDto
  ): Observable<Customer> {
    const formData = new FormData();

    // Append text fields
    Object.keys(customerData).forEach((key) => {
      const value = customerData[key as keyof CustomerUpdateDto];
      if (value !== undefined && value !== null && !(value instanceof File)) {
        formData.append(key, value.toString());
      }
    });

    // Append files
    if (customerData.profilePhoto) {
      formData.append(
        'profilePhoto',
        customerData.profilePhoto,
        customerData.profilePhoto.name
      );
    }
    if (customerData.aadhaarPhoto) {
      formData.append(
        'aadhaarPhoto',
        customerData.aadhaarPhoto,
        customerData.aadhaarPhoto.name
      );
    }

    return this.http.put<Customer>(`${this.apiUrl}/${id}`, formData, {
      headers: this.getAuthHeaders(true),
    });
  }

  // Delete a customer
  deleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Search customers
  searchCustomers(
    query: string,
    page: number = 1,
    pageSize: number = 10
  ): Observable<CustomerPaginatedResponse> {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<CustomerPaginatedResponse>(`${this.apiUrl}/search`, {
      headers: this.getAuthHeaders(),
      params: params,
    });
  }
}
