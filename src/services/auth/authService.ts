import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  User,
  JWTPayload,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  TokenResponse,
} from "../../types/auth";
import { ApiErrorClass } from "../../types/api";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

// Helper function to convert time strings to seconds
function parseExpirationTime(timeStr: string): number {
  if (typeof timeStr === "number") return timeStr;

  const match = timeStr.match(/^(\d+)([smhd])$/);
  if (!match) return 86400; // Default 24h in seconds

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 3600;
    case "d":
      return value * 86400;
    default:
      return 86400;
  }
}

// Mock user database (in production, this would be a real database)
const users: User[] = [
  {
    id: "1",
    email: "admin@seatflow.com",
    name: "Admin User",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export { ApiErrorClass };
export type { JWTPayload };

// JWT utilities
export function generateTokens(user: User): TokenResponse {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: parseExpirationTime(JWT_EXPIRES_IN),
  });
  const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: parseExpirationTime(JWT_REFRESH_EXPIRES_IN),
  });

  return { token, refreshToken };
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return payload;
  } catch (error) {
    return null;
  }
}

export function verifyRefreshToken(
  refreshToken: string,
): { userId: string } | null {
  try {
    const payload = jwt.verify(refreshToken, JWT_SECRET) as { userId: string };
    return payload;
  } catch (error) {
    return null;
  }
}

// Auth service functions
export async function registerUser(
  data: RegisterRequest,
): Promise<AuthResponse> {
  // Check if user already exists
  const existingUser = users.find((u) => u.email === data.email);
  if (existingUser) {
    throw new ApiErrorClass(
      "USER_EXISTS",
      "El usuario ya existe con este email",
    );
  }

  // Hash password (in production, you'd store this)
  const hashedPassword = await hashPassword(data.password);

  // Create new user
  const newUser: User = {
    id: Date.now().toString(),
    email: data.email,
    name: data.name,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  users.push(newUser);

  // Generate tokens
  const tokens = generateTokens(newUser);

  return {
    user: newUser,
    token: tokens.token,
    refreshToken: tokens.refreshToken,
  };
}

export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
  // Find user (in production, you'd query database with hashed password)
  const user = users.find((u) => u.email === data.email);
  if (!user) {
    throw new ApiErrorClass(
      "INVALID_CREDENTIALS",
      "Email o contraseña incorrectos",
    );
  }

  // For demo purposes, we'll skip password verification
  // In production, you'd verify the hashed password here

  // Generate tokens
  const tokens = generateTokens(user);

  return {
    user,
    token: tokens.token,
    refreshToken: tokens.refreshToken,
  };
}

export async function refreshToken(
  refreshToken: string,
): Promise<TokenResponse> {
  const payload = verifyRefreshToken(refreshToken);
  if (!payload) {
    throw new ApiErrorClass("INVALID_TOKEN", "Token de refresco inválido");
  }

  // Find user
  const user = users.find((u) => u.id === payload.userId);
  if (!user) {
    throw new ApiErrorClass("USER_NOT_FOUND", "Usuario no encontrado");
  }

  // Generate new tokens
  return generateTokens(user);
}

export function validateUser(user: any): user is User {
  return (
    typeof user === "object" &&
    typeof user.id === "string" &&
    typeof user.email === "string" &&
    typeof user.name === "string"
  );
}
