import { post, delete_ } from "./core";
import type { LoginRequest, RegisterRequest, LoginResponse } from "../../types";

export const authAPI = {
  login: (credentials: LoginRequest) =>
    post<LoginResponse>("/auth/login", credentials),

  register: (data: RegisterRequest) =>
    post<LoginResponse>("/auth/register", data),

  logout: () => delete_<void>("/auth/logout"),

  refreshToken: () => post<{ token: string }>("/auth/refresh", {}),
};
