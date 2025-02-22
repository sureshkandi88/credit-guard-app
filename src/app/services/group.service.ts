import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';
import { Group, GroupCreateDto, GroupUpdateDto } from '../models/group.model';
import { catchError, map } from 'rxjs/operators';

// Define interfaces for type safety
export interface CustomerGroup {
  customerId: number;
  customer: Customer;
  groupId: number;
  group: Group;
  joinedAt: Date;
  isActive: boolean;
}

export interface Customer {
  id?: number;
  firstName: string;
  lastName?: string | null;
  aadhaarNumber: string;
  phoneNumber?: string | null;
}

export interface Debt {
  id?: number;
  groupId: number;
  group?: Group;
  totalAmount: number;
  remainingAmount?: number;
}

export interface EmiTransaction {
  id?: number;
  debtId: number;
  customerId: number;
  groupId: number;
  emiNumber: number;
  emiAmount: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private apiUrl = `${environment.apiBaseUrl}/Group`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Method to get authentication headers
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getAuthToken();
    
    console.group('Group Service: Auth Headers');
    console.log('Token:', token ? 'Present' : 'Missing');
    console.groupEnd();

    if (!token) {
      console.warn('No authentication token found. Request may fail.');
    }

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || ''}`
    });
  }

  // Retrieve all groups with enhanced authentication
  getGroups(params?: any): Observable<Group[]> {
    console.group('Group Service: Fetching Groups');
    console.log('Request Parameters:', params || 'No parameters');
    
    // Add default parameters if none provided
    const queryParams = params ? new HttpParams({ fromObject: params }) : new HttpParams();

    return this.http.get<Group[]>(this.apiUrl, { 
      params: queryParams,
      headers: this.getAuthHeaders(), // Add authentication headers
      observe: 'response'  // Capture full response
    }).pipe(
      map(response => {
        console.log('Response Status:', response.status);
        console.log('Response Headers:', response.headers);
        
        const groups = response.body || [];
        console.log('Fetched Groups:', groups);
        console.log('Group Count:', groups.length);
        
        console.groupEnd();
        return groups;
      }),
      catchError((error: HttpErrorResponse) => {
        console.group('Group Fetch Error');
        console.error('Error Status:', error.status);
        console.error('Error Message:', error.message);
        console.error('Error Details:', error.error);
        console.groupEnd();

        // Handle specific authentication errors
        if (error.status === 401) {
          // Redirect to login or refresh token
          this.authService.handleAuthenticationError();
        }

        // Rethrow the error after logging
        return throwError(() => new Error('Failed to fetch groups. Please log in again.'));
      })
    );
  }

  // Get a single group by ID
  getGroupById(id: string): Observable<Group> {
    return this.http.get<Group>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Create a new group using GroupCreateDto with enhanced error handling
  createGroup(group: GroupCreateDto): Observable<Group> {
    // Log the full payload details
    console.group('Group Creation Request');
    console.log('Payload:', JSON.stringify(group));
    console.log('Payload Type:', typeof group);
    console.log('Payload Keys:', Object.keys(group));
    console.groupEnd();

    // Add more fields if required by the backend
    const fullPayload = {
      ...group,
      isActive: true, // Default active status
      createdBy: this.authService.getCurrentUserId(), // Add user ID if needed
      tenantId: this.authService.getTenantId() // Add tenant ID if multi-tenant
    };

    return this.http.post<Group>(this.apiUrl, fullPayload, {
      headers: this.getAuthHeaders(),
      observe: 'response'
    }).pipe(
      map(response => {
        console.group('Group Creation Response');
        console.log('Full Response:', response);
        console.log('Response Body:', response.body);
        console.log('Response Status:', response.status);
        console.groupEnd();

        // Ensure non-null return
        const body = response.body;
        if (!body) {
          throw new Error('No group data returned from server');
        }
        return body;
      }),
      catchError((error: HttpErrorResponse) => {
        console.group('Group Creation Error');
        console.error('Error Status:', error.status);
        console.error('Error Message:', error.error?.message);
        console.error('Error Details:', error.error);
        console.error('Error Headers:', error.headers);
        console.groupEnd();

        // Rethrow the error after logging
        return throwError(() => error);
      })
    );
  }

  // Update an existing group with enhanced error handling
  updateGroup(id: string, group: GroupUpdateDto): Observable<Group> {
    console.log(`Updating group ${id} with payload:`, JSON.stringify(group));
    
    return this.http.put<Group>(`${this.apiUrl}/${id}`, group, {
      headers: this.getAuthHeaders(),
      observe: 'response'
    }).pipe(
      map(response => {
        console.log('Group update response:', response);
        // Ensure non-null return
        const body = response.body;
        if (!body) {
          throw new Error('No group data returned from server');
        }
        return body;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Group update error:', {
          status: error.status,
          message: error.error?.message || 'Unknown error',
          details: error.error
        });
        
        // Rethrow the error after logging
        return throwError(() => error);
      })
    );
  }

  // Delete a group
  deleteGroup(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Add a customer to a group
  addCustomerToGroup(groupId: number, customerId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${groupId}/add-customer/${customerId}`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  // Remove a customer from a group
  removeCustomerFromGroup(groupId: number, customerId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${groupId}/remove-customer/${customerId}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Search groups
  searchGroups(query: string): Observable<Group[]> {
    return this.http.get<Group[]>(`${this.apiUrl}/search`, {
      headers: this.getAuthHeaders(),
      params: { query }
    });
  }

  // Search groups with pagination
  searchGroupsPaginated(
    query: string, 
    page: number = 1, 
    pageSize: number = 10
  ): Observable<PaginatedResponse<Group>> {
    return this.http.get<PaginatedResponse<Group>>(`${this.apiUrl}/search`, {
      headers: this.getAuthHeaders(),
      params: {
        query,
        page: page.toString(),
        pageSize: pageSize.toString()
      }
    });
  }
}
