import { NextRequest, NextResponse } from "next/server";
import { loginUser, ApiErrorClass } from "@/services/auth/authService";
import { rateLimit } from "@/middleware/auth";
import { loginSchema } from "@/types/api";

export async function POST(req: NextRequest) {
  // Aplicar rate limiting
  const rateLimitResponse = rateLimit(10, 900000)(req);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await req.json();

    // Validar datos de entrada
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Datos de entrada inválidos",
          errors: validationResult.error.issues.map((issue) => issue.message),
        },
        { status: 400 },
      );
    }

    const { email, password } = validationResult.data;

    // Iniciar sesión
    const authResponse = await loginUser({ email, password });

    return NextResponse.json(
      {
        success: true,
        message: "Inicio de sesión exitoso",
        data: {
          user: authResponse.user,
          token: authResponse.token,
          refreshToken: authResponse.refreshToken,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Login error:", error);

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
