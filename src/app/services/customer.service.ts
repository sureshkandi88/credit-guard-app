import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEventType } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Customer } from '../models/customer.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = environment.apiBaseUrl + '/Customer';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Get headers with authorization token
  private getHeaders(): HttpHeaders {
    const token = this.authService.getAuthToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Get all customers
  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  // Get customer by ID
  getCustomerById(id: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Create a new customer with file upload support
  createCustomer(customerData: FormData): Observable<Customer> {
    // Log FormData contents for debugging
    customerData.forEach((value, key) => {
      console.log(`FormData Entry - ${key}:`, value);
    });

    // Create headers without explicitly setting Content-Type
    const headers = this.getHeaders();

    return this.http.post<Customer>(`${this.apiUrl}`, customerData, { 
      headers: headers
    });
  }

  // Update an existing customer with file upload support
  updateCustomer(customerId: string, customerData: FormData): Observable<Customer> {
    // Log FormData contents for debugging
    customerData.forEach((value, key) => {
      console.log(`FormData Entry - ${key}:`, value);
    });

    // Create headers without explicitly setting Content-Type
    const headers = this.getHeaders();

    return this.http.put<Customer>(`${this.apiUrl}/${customerId}`, customerData, { 
      headers: headers
    });
  }

  // Delete a customer
  deleteCustomer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Search customers by name or Aadhaar number
  searchCustomers(query: string): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.apiUrl}/search`, {
      headers: this.getHeaders(),
      params: { query }
    });
  }
}
