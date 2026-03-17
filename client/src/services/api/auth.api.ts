import { post } from "./core";
import type { LoginRequest, RegisterRequest, LoginResponse } from "../../types";

export const authAPI = {
  login: (credentials: LoginRequest) =>
    post<LoginResponse>("/auth/login", credentials),

  register: (data: RegisterRequest) =>
    post<LoginResponse>("/auth/register", data),

  logout: () => post<void>("/auth/logout", {}),

  refreshSession: () => post<void>("/auth/refresh", {}),
};
