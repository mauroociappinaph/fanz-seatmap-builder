import { NextRequest, NextResponse } from "next/server";
import { registerUser, ApiErrorClass } from "@/services/auth/authService";
import { rateLimit } from "@/middleware/auth";
import { registerSchema } from "@/types/api";

export async function POST(req: NextRequest) {
  // Aplicar rate limiting
  const rateLimitResponse = rateLimit(5, 900000)(req);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await req.json();

    // Validar datos de entrada
    const validationResult = registerSchema.safeParse(body);
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

    const { name, email, password } = validationResult.data;

    // Registrar usuario
    const authResponse = await registerUser({ name, email, password });

    return NextResponse.json(
      {
        success: true,
        message: "Usuario registrado exitosamente",
        data: {
          user: authResponse.user,
          token: authResponse.token,
          refreshToken: authResponse.refreshToken,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);

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
