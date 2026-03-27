export interface AuthResponse {
  accessToken: string;
  user: UserPayload;
}

export interface UserPayload {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}
