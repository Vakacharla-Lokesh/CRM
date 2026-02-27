export * from "./user";
export * from "./leads";
export * from "./auth";
export * from "./deals";
export * from "./organizations";
export * from "./tenant";
export * from "./calls";
export * from "./comments";
export * from "./attachments";
export * from "./notifications";
export * from "./workflows";
export * from "./leadActivity";
export * from "./role";

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
