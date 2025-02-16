export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: string;
  username: string;
  role: string;
  expiresAt: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  role: string;
  firstName?: string;
  lastName?: string;
}
