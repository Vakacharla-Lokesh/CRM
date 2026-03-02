import type { User } from "./user";

export interface LoginRequest {
  userEmail: string;
  password: string;
}

export type LoginCredentials = LoginRequest;

export interface RegisterRequest {
  firstName: string;
  lastName?: string;
  userEmail: string;
  password: string;
  tenantName: string;
}

export type SignupData = RegisterRequest;

export interface LoginResponse {
  message: string;
  success: boolean;
  user: User;
}

export interface AuthResponse {
  message: string;
  success: boolean;
  user: User;
}

export interface AuthUser extends User {}

export interface AuthError {
  code:
    | "INVALID_CREDENTIALS"
    | "USER_NOT_FOUND"
    | "UNAUTHORIZED"
    | "TOKEN_EXPIRED";
  message: string;
}

export interface PasswordResetData {
  token: string;
  newPassword: string;
  confirmPassword?: string;
}
