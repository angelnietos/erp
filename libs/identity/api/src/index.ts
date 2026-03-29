// Shared interfaces for Identity domain
export interface UserPayload {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}

export interface AuthResponse {
  accessToken: string;
  user: UserPayload;
}

// DTOs shared between Backend and Frontend (no decorators - pure types)
export interface LoginCredentials {
  email: string;
  password: string;
}
