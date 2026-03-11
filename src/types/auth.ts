import { z } from "zod";

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// JWT payload
export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

// Auth context
export interface AuthContext {
  user: User;
  token: string;
  refreshToken: string;
}

// Request types
export interface AuthRequest {
  email: string;
  password: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Response types
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface TokenResponse {
  token: string;
  refreshToken: string;
}

// Validation schemas
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token es requerido"),
});

// Type guards
export function isValidUser(user: any): user is User {
  return (
    typeof user === "object" &&
    typeof user.id === "string" &&
    typeof user.email === "string" &&
    typeof user.name === "string" &&
    user.createdAt instanceof Date &&
    user.updatedAt instanceof Date
  );
}

export function isValidJWTPayload(payload: any): payload is JWTPayload {
  return (
    typeof payload === "object" &&
    typeof payload.userId === "string" &&
    typeof payload.email === "string" &&
    typeof payload.name === "string"
  );
}
