export interface Customer {
  id?: string;
  firstName: string;
  lastName: string;
  aadhaarNumber: string;
  phoneNumber: string;
  address: string; // Full address as a single string
  profilePhotoPath?: string;
  aadhaarPhotoPath?: string;
  activeGroupId?: number;
  isActive?: boolean;
  customerGroups?: any[]; // Define a more specific type if needed
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}
