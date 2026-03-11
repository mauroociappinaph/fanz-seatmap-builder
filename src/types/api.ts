import { SeatMap, MapElement, Seat } from "../domain/types";

// Project types
export interface Project {
  id: string;
  name: string;
  description?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  seatMap?: SeatMap;
}

export interface ProjectCreateRequest {
  name: string;
  description?: string;
}

export interface ProjectUpdateRequest {
  name?: string;
  description?: string;
}

// Seat operations
export interface BulkSeatOperation {
  operation: "update" | "delete" | "create";
  seats: Seat[];
  filters?: {
    area?: string;
    row?: string;
    status?: string;
  };
}

export interface BulkSeatResponse {
  success: boolean;
  affectedSeats: number;
  errors?: string[];
}

// Integration types
export interface Integration {
  id: string;
  provider: "eventbrite" | "ticketmaster" | "stubhub";
  name: string;
  apiKey: string;
  projectId: string;
  isActive: boolean;
  lastSync?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IntegrationCreateRequest {
  provider: "eventbrite" | "ticketmaster" | "stubhub";
  name: string;
  apiKey: string;
}

export interface IntegrationSyncRequest {
  provider: string;
  syncType: "full" | "incremental";
}

export interface IntegrationSyncResponse {
  success: boolean;
  syncedItems: number;
  errors?: string[];
}

// Webhook types
export interface WebhookEvent {
  id: string;
  provider: string;
  eventType: string;
  payload: any;
  processedAt?: Date;
  createdAt: Date;
}

export interface WebhookPayload {
  event: string;
  data: any;
  timestamp: string;
  signature?: string;
}

// API response wrappers
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export class ApiErrorClass extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Rate limiting
export interface RateLimitInfo {
  remaining: number;
  resetTime: Date;
  limit: number;
}

// Validation schemas
import { z } from "zod";

export const projectCreateSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre del proyecto debe tener al menos 2 caracteres"),
  description: z.string().optional(),
});

export const projectUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
});

export const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export const bulkSeatOperationSchema = z.object({
  operation: z.enum(["update", "delete", "create"]),
  seats: z.array(z.any()),
  filters: z
    .object({
      area: z.string().optional(),
      row: z.string().optional(),
      status: z.string().optional(),
    })
    .optional(),
});

export const integrationCreateSchema = z.object({
  provider: z.enum(["eventbrite", "ticketmaster", "stubhub"]),
  name: z
    .string()
    .min(2, "El nombre de la integración debe tener al menos 2 caracteres"),
  apiKey: z.string().min(1, "La API key es requerida"),
});

export const integrationSyncSchema = z.object({
  provider: z.string(),
  syncType: z.enum(["full", "incremental"]),
});

// Type guards
export function isValidProject(project: any): project is Project {
  return (
    typeof project === "object" &&
    typeof project.id === "string" &&
    typeof project.name === "string" &&
    typeof project.userId === "string" &&
    project.createdAt instanceof Date &&
    project.updatedAt instanceof Date
  );
}

export function isValidIntegration(
  integration: any,
): integration is Integration {
  return (
    typeof integration === "object" &&
    typeof integration.id === "string" &&
    typeof integration.provider === "string" &&
    typeof integration.name === "string" &&
    typeof integration.apiKey === "string" &&
    typeof integration.isActive === "boolean" &&
    integration.createdAt instanceof Date &&
    integration.updatedAt instanceof Date
  );
}

export function isValidApiResponse<T>(
  response: any,
): response is ApiResponse<T> {
  return (
    typeof response === "object" &&
    typeof response.success === "boolean" &&
    (response.data === undefined || response.data !== null)
  );
}
