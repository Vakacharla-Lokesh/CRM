import type { User } from "./user";

export interface AuthUser extends User {
  token: string;
  refreshToken?: string;
}

export interface LoginRequest {
  userEmail: string;
  password: string;
}

export type LoginCredentials = LoginRequest;

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName?: string;
  userEmail: string;
  password: string;
  tenantName: string;
}

export type SignupData = RegisterRequest;

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

export interface PasswordResetData {
  token: string;
  newPassword: string;
  confirmPassword?: string;
}
