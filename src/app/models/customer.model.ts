export interface Customer {
  id?: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  aadhaarNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    pinCode: string;
  };
  location?: {
    latitude: number;
    longitude: number;
  };
  photo?: string; // Base64 or URL
  aadhaarPhoto?: string; // Base64 or URL
  createdAt?: Date;
  updatedAt?: Date;
}
