import { NextRequest, NextResponse } from "next/server";
import { refreshToken, ApiErrorClass } from "@/services/auth/authService";
import { rateLimit } from "@/middleware/auth";

export async function POST(req: NextRequest) {
  // Aplicar rate limiting
  const rateLimitResponse = rateLimit(10, 900000)(req);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await req.json();

    if (!body.refreshToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Token de refresco requerido",
        },
        { status: 400 },
      );
    }

    const { refreshToken: refreshTokenValue } = body;

    // Refrescar token
    const tokens = await refreshToken(refreshTokenValue);

    return NextResponse.json(
      {
        success: true,
        message: "Token refrescado exitosamente",
        data: {
          token: tokens.token,
          refreshToken: tokens.refreshToken,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Refresh token error:", error);

    if (error instanceof ApiErrorClass) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      { status: 500 },
    );
  }
}
