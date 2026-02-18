/**
 * Auth Types
 */

import { User } from './user';

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
  firstName: string;
  lastName?: string;
  userEmail: string;
  userPassword: string;
  tenantName: string;
}

// Alias for RegisterRequest
export type SignupData = RegisterRequest;

// Generic auth response type
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface AuthError {
  code:
    | "INVALID_CREDENTIALS"
    | "USER_NOT_FOUND"
    | "UNAUTHORIZED"
    | "TOKEN_EXPIRED";
  message: string;
}
