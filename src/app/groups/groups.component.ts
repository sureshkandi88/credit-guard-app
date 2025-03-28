import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NgbPaginationModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { GroupService } from '../services/group.service';
import { Group, GroupCreateDto, GroupUpdateDto } from '../models/group.model';
import { HeaderComponent } from '../shared/header/header.component';
import { HttpErrorResponse } from '@angular/common/http';
import { isNil } from '../shared/utils/is-nil.util';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    HeaderComponent,
  ],
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss'],
})
export class GroupsComponent implements OnInit {
  @ViewChild('groupModal') groupModal!: ElementRef;

  groups: Group[] = [];
  selectedGroup: Group | null = null;
  groupForm!: FormGroup;
  isEditMode = false;
  isLoading = false;
  errorMessage: string | null = null;
  locationErrors: { required?: boolean; maxlength?: boolean } = {};

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  // Search
  searchQuery = '';

  constructor(
    private groupService: GroupService,
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    console.group('Groups Component: Initialization');
    console.log('Component initialized, loading groups...');

    // Set initial loading state
    this.isLoading = true;
    this.errorMessage = null;

    // Load groups with error handling
    this.loadGroups();
  }

  initializeForm(): void {
    this.groupForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      location: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(250)]],
    });
  }

  loadGroups(): void {
    console.log('Attempting to load groups...');

    this.groupService.getGroups().subscribe({
      next: (groups) => {
        console.group('Groups Loaded Successfully');
        console.log('Received Groups:', groups);
        console.log('Group Count:', groups.length);
        console.groupEnd();

        // Update component state
        this.groups = groups;
        this.totalItems = groups.length;
        this.isLoading = false;
        this.errorMessage = null;
      },
      error: (error) => {
        console.group('Group Loading Error');
        console.error('Failed to load groups:', error);
        console.groupEnd();

        // Update error state
        this.groups = [];
        this.totalItems = 0;
        this.isLoading = false;
        this.errorMessage =
          error.message || 'Failed to load groups. Please try again.';
      },
      complete: () => {
        console.log('Group loading process completed');
        this.isLoading = false;
      },
    });
  }

  retryLoadGroups(): void {
    console.log('Retrying group load...');
    this.isLoading = true;
    this.errorMessage = null;
    this.loadGroups();
  }

  searchGroups(): void {
    if (!this.searchQuery) {
      this.loadGroups();
      return;
    }

    this.isLoading = true;
    this.groupService.searchGroups(this.searchQuery).subscribe({
      next: (groups: Group[]) => {
        this.groups = groups || [];
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.groups = [];
        this.errorMessage = error.error?.message || 'Failed to search groups';
        this.isLoading = false;
      },
    });
  }

  openAddGroupModal(content: any): void {
    this.isEditMode = false;
    this.selectedGroup = null;
    this.groupForm.reset();
    this.modalService.open(content, {
      ariaLabelledBy: 'group-modal-title',
      centered: true,
    });
  }

  openEditGroupModal(group: Group, content: any): void {
    this.isEditMode = true;
    this.selectedGroup = group;
    this.groupForm.patchValue({
      name: group.name,
      description: group.description || '',
    });
    this.modalService.open(content, {
      ariaLabelledBy: 'group-modal-title',
      centered: true,
    });
  }

  submitGroup(modal: any): void {
    if (this.groupForm.invalid) {
      return;
    }

    // Prepare group data with required fields
    const groupData: GroupCreateDto = {
      name: this.groupForm.get('name')?.value,
      location: this.groupForm.get('location')?.value,
      description: this.groupForm.get('description')?.value || undefined,
      isActive: true,
      debts: [],
      customerGroups: [],
      activeCustomers: [],
      emiTransactions: [],
    };

    this.isLoading = true;

    if (this.isEditMode && this.selectedGroup?.id) {
      // Prepare update data with required fields
      const updateData: GroupUpdateDto = {
        name: groupData.name,
        location: this.groupForm.get('location')?.value,
        description: groupData.description,
        debts: [],
        customerGroups: [],
        activeCustomers: [],
        emiTransactions: [],
      };

      this.groupService
        .updateGroup(String(this.selectedGroup.id), updateData)
        .subscribe({
          next: (updatedGroup) => {
            const index = this.safeGroups.findIndex(
              (g) => g.id === updatedGroup.id
            );
            if (index !== -1) {
              this.groups[index] = updatedGroup;
            }
            modal.dismiss();
            this.isLoading = false;
          },
          error: (error: HttpErrorResponse) => {
            // More detailed error handling
            if (error.error instanceof ErrorEvent) {
              // Client-side error
              this.errorMessage = `Error: ${error.error.message}`;
            } else {
              // Server-side error
              this.errorMessage =
                error.error?.message ||
                `Server Error: ${error.status} ${error.statusText}`;
            }
            console.error('Group update error:', error);
            this.isLoading = false;
          },
        });
    } else {
      // Create new group
      this.groupService.createGroup(groupData).subscribe({
        next: (newGroup) => {
          this.groups.push(newGroup);
          modal.dismiss();
          this.isLoading = false;
        },
        error: (error: HttpErrorResponse) => {
          // More detailed error handling
          if (error.error instanceof ErrorEvent) {
            // Client-side error
            this.errorMessage = `Error: ${error.error.message}`;
          } else {
            // Server-side error
            this.errorMessage =
              error.error?.message ||
              `Server Error: ${error.status} ${error.statusText}`;
          }
          console.error('Group creation error:', error);
          this.isLoading = false;
        },
      });
    }
  }

  deleteGroup(group: Group): void {
    if (!group.id) return;

    const confirmDelete = confirm(
      `Are you sure you want to delete the group "${group.name}"?`
    );
    if (!confirmDelete) return;

    this.isLoading = true;
    this.groupService.deleteGroup(String(group.id)).subscribe({
      next: () => {
        this.groups = this.groups.filter((g) => g.id !== group.id);
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error.error?.message || 'Failed to delete group';
        this.isLoading = false;
      },
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.searchQuery ? this.searchGroups() : this.loadGroups();
  }

  // Utility method to convert string to Date
  private convertToDate(value: Date | string | undefined): Date | undefined {
    if (value === undefined) {
      return undefined;
    }

    // If it's already a Date, return it
    if (value instanceof Date) {
      return value;
    }

    // If it's a string, try to parse it
    try {
      const parsedDate = new Date(value);
      return isNaN(parsedDate.getTime()) ? undefined : parsedDate;
    } catch {
      return undefined;
    }
  }

  // Utility method to safely access group properties
  safeGroupProperty<K extends keyof Group>(
    group: Group | null | undefined,
    property: K,
    defaultValue: Group[K] = '' as Group[K]
  ): Group[K] {
    // Use type-safe null check
    if (group === null || group === undefined) {
      return defaultValue;
    }

    // Special handling for date properties
    if (property === 'createdAt' || property === 'updatedAt') {
      const dateValue = group[property];
      return this.convertToDate(dateValue as Date | string) as Group[K];
    }

    // Check if the property exists and is not null/undefined
    return group[property] ?? defaultValue;
  }

  get safeGroups(): Group[] {
    return this.groups.filter((group) => !isNil(group));
  }

  get hasGroups(): boolean {
    return this.safeGroups.length > 0;
  }

  get nameErrors(): boolean {
    const nameControl = this.groupForm.get('name');
    return !!(
      nameControl?.invalid &&
      (nameControl?.dirty || nameControl?.touched)
    );
  }

  get descriptionErrors(): boolean {
    const descriptionControl = this.groupForm.get('description');
    return !!(
      descriptionControl?.invalid &&
      (descriptionControl?.dirty || descriptionControl?.touched)
    );
  }
}
