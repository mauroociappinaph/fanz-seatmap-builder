import { NextRequest, NextResponse } from "next/server";
import { verifyToken, JWTPayload } from "../services/auth/authService";
import { ApiErrorClass } from "../types/api";

// Middleware para proteger rutas de API
export function withAuth(
  handler: (req: NextRequest, payload: JWTPayload) => Promise<Response>,
) {
  return async (req: NextRequest): Promise<Response> => {
    try {
      // Extraer token del header Authorization
      const authHeader = req.headers.get("authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
          { success: false, message: "Token de autorización requerido" },
          { status: 401 },
        );
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Verificar token
      const payload = verifyToken(token);

      if (!payload) {
        return NextResponse.json(
          { success: false, message: "Token inválido o expirado" },
          { status: 401 },
        );
      }

      // Pasar el payload al handler
      return await handler(req, payload);
    } catch (error) {
      console.error("Auth middleware error:", error);

      if (error instanceof ApiErrorClass) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 401 },
        );
      }

      return NextResponse.json(
        { success: false, message: "Error de autenticación" },
        { status: 500 },
      );
    }
  };
}

// Middleware para Next.js 16 (App Router)
export function authMiddleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Proteger rutas de API
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/")) {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Token de autorización requerido" },
        { status: 401 },
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Token inválido o expirado" },
        { status: 401 },
      );
    }

    // Añadir payload al request para que esté disponible en la ruta
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-payload", JSON.stringify(payload));

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

// Función para obtener el payload del usuario desde headers
export function getUserPayloadFromRequest(req: NextRequest): JWTPayload | null {
  const payloadHeader = req.headers.get("x-user-payload");
  if (!payloadHeader) {
    return null;
  }

  try {
    return JSON.parse(payloadHeader);
  } catch (error) {
    return null;
  }
}

// Rate limiting simple (para endpoints de autenticación)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(maxRequests: number = 10, windowMs: number = 900000) {
  return (req: NextRequest): Response | null => {
    const ip =
      req.headers.get("x-real-ip") ||
      req.headers.get("x-forwarded-for") ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";
    const now = Date.now();

    const userRateLimit = rateLimitMap.get(ip);

    if (!userRateLimit) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return null;
    }

    if (now > userRateLimit.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return null;
    }

    if (userRateLimit.count >= maxRequests) {
      return new Response(
        JSON.stringify({
          success: false,
          message:
            "Demasiadas solicitudes. Por favor intente de nuevo más tarde.",
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    userRateLimit.count++;
    return null;
  };
}
