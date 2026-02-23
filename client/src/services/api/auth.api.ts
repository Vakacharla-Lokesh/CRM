import { post } from "./core";
import type { LoginRequest, RegisterRequest, LoginResponse } from "../../types";

export const authAPI = {
  login: (credentials: LoginRequest) =>
    post<LoginResponse>("/auth/login", credentials),

  register: (data: RegisterRequest) =>
    post<LoginResponse>("/auth/register", data),

  logout: (refreshToken?: string) =>
    post<void>("/auth/logout", { refreshToken }),

  refreshToken: (refreshToken: string) =>
    post<{ token: string; refreshToken: string }>("/auth/refresh", {
      refreshToken,
    }),
};
