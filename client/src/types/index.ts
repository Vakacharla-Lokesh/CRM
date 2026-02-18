/**
 * Common Type Definitions
 * Centralized type definitions for the CRM application
 */

// API Types
export interface ApiRequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
  timeout?: number;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  success?: boolean;
}

export interface ApiError extends Error {
  status?: number;
  data?: unknown;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  role: 'admin' | 'manager' | 'user' | 'sales' | string;
  isActive: boolean;
  avatar?: string;
  phone?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  [key: string]: unknown;
}

export interface UserFilters {
  role?: string;
  isActive?: boolean;
  search?: string;
}

export interface UserStatistics {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<string, number>;
}

// Lead Types
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'new' | 'contacted' | 'qualified' | 'lost' | string;
  source?: string;
  stage?: string;
  score?: number;
  assignedTo?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  [key: string]: unknown;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
  username?: string;
  organizationName?: string;
  [key: string]: unknown;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface PasswordResetData {
  token: string;
  newPassword: string;
}

// Form Validation Types
export interface ValidationRule {
  required?: boolean;
  email?: boolean;
  phone?: boolean;
  url?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => boolean;
  message?: string;
}

export interface ValidationRules {
  [field: string]: ValidationRule;
}

export interface ValidationErrors {
  [field: string]: string;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;
