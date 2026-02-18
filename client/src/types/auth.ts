/**
 * Auth Types
 */

export interface AuthUser extends User {
  token: string;
  refreshToken?: string;
}

export interface LoginRequest {
  userEmail: string;
  userPassword: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface RegisterRequest {
  userName: string;
  userEmail: string;
  userPassword: string;
  organizationName: string;
}

export interface AuthError {
  code:
    | "INVALID_CREDENTIALS"
    | "USER_NOT_FOUND"
    | "UNAUTHORIZED"
    | "TOKEN_EXPIRED";
  message: string;
}
